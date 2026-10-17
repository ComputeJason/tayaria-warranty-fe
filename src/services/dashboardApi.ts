// Real backend for the master dashboard: GET /master/dashboard and /master/dashboard/trend
// (tayaria-warranty-be/handlers/dashboard.go). Maps the snake_case JSON into the view types the
// dashboard components use, so they don't care whether data comes from here or the mock.

import { format, parseISO } from 'date-fns';
import { getApiUrl } from '@/config/api';
import type {
  BrandMixPoint, BrandRow, DashboardData, DateRange, Granularity, TrendData,
} from './dashboardTypes';
import { buildBuckets, toInterval } from './dashboardBuckets';

// ── Backend response shapes (models/dashboard.go) ────────────────────────────

interface ApiRange { from: string; to: string }
interface ApiCount { current: number; previous: number | null }
interface ApiMeasure { current: number | null; previous: number | null }
interface ApiCoverageCount { recorded: number; total: number }

interface ApiBrandRow {
  brand: string;
  warranties: number;
  previous_warranties: number;
  share: number;
  claims: number;
  claims_per_100: number | null;
  approved: number;
  rejected: number;
  tyres_replaced: number;
  approval_rate: number | null;
}

interface ApiDashboard {
  range: ApiRange;
  previous_range: ApiRange | null;
  brand_coverage: { recorded_since: string | null; current: ApiCoverageCount; previous: ApiCoverageCount };
  not_recorded: ApiBrandRow | null;
  kpis: {
    warranties: ApiCount;
    claims: ApiCount;
    claim_outcomes: { approved: number; rejected: number; open: number };
    median_days_to_resolution: ApiMeasure;
  };
  brands: ApiBrandRow[];
  brand_mix: { bucket: 'week' | 'month'; series: string[]; points: { start: string; counts: Record<string, number> }[] };
  rejection_reasons: { reason: string; count: number }[];
}

interface ApiTrend {
  granularity: Granularity;
  points: { start: string; warranties: number; claims: number }[];
}

// ── Request helpers ──────────────────────────────────────────────────────────

const ISO = 'yyyy-MM-dd';

const get = async <T,>(path: string, params: Record<string, string>): Promise<T> => {
  const token = localStorage.getItem('masterToken');
  const res = await fetch(`${getApiUrl(path)}?${new URLSearchParams(params)}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return res.json();
};

const toRange = (r: ApiRange): DateRange => ({ from: parseISO(r.from), to: parseISO(r.to) });

const toBrandRow = (r: ApiBrandRow): BrandRow => ({
  brand: r.brand,
  warranties: r.warranties,
  previousWarranties: r.previous_warranties,
  share: r.share,
  claims: r.claims,
  claimsPer100: r.claims_per_100,
  approved: r.approved,
  rejected: r.rejected,
  tyresReplaced: r.tyres_replaced,
  approvalRate: r.approval_rate,
});

// ── Endpoints ────────────────────────────────────────────────────────────────

export const fetchDashboard = async (range: DateRange, previousRange: DateRange | null): Promise<DashboardData> => {
  const d = await get<ApiDashboard>('/master/dashboard', {
    from: format(range.from, ISO),
    to: format(range.to, ISO),
    ...(previousRange && { prev_from: format(previousRange.from, ISO), prev_to: format(previousRange.to, ISO) }),
  });

  const current = toRange(d.range);
  // The backend returns bucket start dates; labels come from the same bucketing the mock uses.
  const countsByStart = new Map(d.brand_mix.points.map((p) => [p.start, p.counts]));
  const mixPoints: BrandMixPoint[] = buildBuckets(toInterval(current), d.brand_mix.bucket).buckets.map((b) => {
    const counts = countsByStart.get(b.key) ?? {};
    const point: BrandMixPoint = { label: b.label };
    d.brand_mix.series.forEach((s) => (point[s] = counts[s] ?? 0));
    return point;
  });

  return {
    range: current,
    previousRange: d.previous_range ? toRange(d.previous_range) : null,
    brandCoverage: {
      recordedSince: d.brand_coverage.recorded_since ? parseISO(d.brand_coverage.recorded_since) : null,
      current: d.brand_coverage.current,
      previous: d.brand_coverage.previous,
    },
    notRecorded: d.not_recorded ? toBrandRow(d.not_recorded) : null,
    kpis: {
      warranties: d.kpis.warranties,
      claims: d.kpis.claims,
      claimOutcomes: d.kpis.claim_outcomes,
      medianDaysToResolution: d.kpis.median_days_to_resolution,
    },
    brands: d.brands.map(toBrandRow),
    brandMix: { bucket: d.brand_mix.bucket, series: d.brand_mix.series, points: mixPoints },
    rejectionReasons: d.rejection_reasons,
  };
};

export const fetchTrend = async (range: DateRange, granularity: Granularity): Promise<TrendData> => {
  const d = await get<ApiTrend>('/master/dashboard/trend', {
    from: format(range.from, ISO),
    to: format(range.to, ISO),
    granularity,
  });
  const byStart = new Map(d.points.map((p) => [p.start, p]));
  return {
    granularity: d.granularity,
    points: buildBuckets(toInterval(range), granularity).buckets.map((b) => ({
      label: b.label,
      tooltipLabel: b.tooltipLabel,
      partial: b.partial,
      warranties: byStart.get(b.key)?.warranties ?? 0,
      claims: byStart.get(b.key)?.claims ?? 0,
    })),
  };
};
