// Mock backend for the master dashboard (VITE_DASHBOARD_SOURCE=mock, dev only).
//
// Aggregates raw warranty + claim records the same way the backend's /master/dashboard does
// (tayaria-warranty-be/db/dashboard.go). Records come from src/mocks/dashboardFixture.json – a
// gitignored, PII-free extract of real CSV exports built by scripts/build-dashboard-fixture.py –
// or, when that file isn't present, from a deterministic synthetic generator.

import { addDays, differenceInCalendarDays, endOfDay, isWithinInterval, startOfDay, startOfMonth, subMonths } from 'date-fns';
import { BRANDS } from '@/constants/tyreBrands';
import {
  NOT_RECORDED, type BrandMixPoint, type BrandRow, type DashboardData, type DateRange, type Granularity,
  type TrendData, type TrendPoint,
} from './dashboardTypes';
import { buildBuckets, toInterval } from './dashboardBuckets';

// ── Raw mock records ─────────────────────────────────────────────────────────

type ClaimStatus = 'unacknowledged' | 'pending' | 'approved' | 'rejected';

interface MockWarranty {
  brand: string;
  createdAt: Date;
}

interface MockClaim {
  brand: string;
  createdAt: Date;
  decidedAt: Date | null;
  status: ClaimStatus;
  quantity: number;          // 0 when unknown (claims made before quantity was captured)
  rejectionReason: string | null;
}

interface Records {
  warranties: MockWarranty[];
  claims: MockClaim[];
}

const REJECTION_REASONS = [
  'Mechanical Failure',
  'Over Warranty Period',
  'Not Compliant - No Marking',
  'Not Compliant - Remaining Tread Depth <6mm',
] as const;

// Relative sales volume, claim propensity and approval odds per brand – tuned so brands differ
// in ways that are interesting to look at (e.g. a mid-volume brand with a high claim rate).
const BRAND_PROFILE: Record<string, { weight: number; claimRate: number; approveRate: number }> = {
  'Pirelli':      { weight: 32, claimRate: 0.11, approveRate: 0.78 },
  'Kumho':        { weight: 17, claimRate: 0.14, approveRate: 0.72 },
  'GT Radial':    { weight: 14, claimRate: 0.19, approveRate: 0.66 },
  'RoadX':        { weight: 10, claimRate: 0.23, approveRate: 0.61 },
  'General Tire': { weight: 8,  claimRate: 0.12, approveRate: 0.75 },
  'Goodyear':     { weight: 8,  claimRate: 0.09, approveRate: 0.81 },
  'Continental':  { weight: 6,  claimRate: 0.08, approveRate: 0.83 },
  'Dunlop':       { weight: 5,  claimRate: 0.15, approveRate: 0.70 },
};

// Small seeded PRNG so the demo looks the same on every reload.
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const pickWeighted = <T,>(rand: () => number, items: T[], weights: number[]): T => {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
};

const generateRecords = (today: Date): Records => {
  const rand = mulberry32(20261014);
  const brands = BRANDS.filter((b) => BRAND_PROFILE[b]);
  const weights = brands.map((b) => BRAND_PROFILE[b].weight);
  const start = subMonths(startOfMonth(today), 30);
  const totalDays = differenceInCalendarDays(today, start);

  const warranties: MockWarranty[] = [];
  const claims: MockClaim[] = [];

  for (let d = 0; d <= totalDays; d++) {
    const day = addDays(start, d);
    // Gentle growth over time + a year-end bump + weekend dip.
    const growth = 1.2 + (d / totalDays) * 3.6;
    const seasonal = 1 + 0.1 * Math.sin(((day.getMonth() - 8) / 12) * 2 * Math.PI);
    const weekend = day.getDay() === 0 ? 0.4 : 1;
    const expected = growth * seasonal * weekend;
    const count = Math.max(0, Math.round(expected + (rand() - 0.5) * 3));

    for (let i = 0; i < count; i++) {
      const brand = pickWeighted(rand, brands, weights);
      const createdAt = new Date(day.getTime() + rand() * 10 * 3600_000 + 9 * 3600_000);
      warranties.push({ brand, createdAt });

      const profile = BRAND_PROFILE[brand];
      if (rand() >= profile.claimRate) continue;

      const claimCreated = addDays(createdAt, 20 + Math.floor(rand() * 260));
      if (claimCreated > today) continue;

      // Decision time: mostly 1–5 days, long tail up to ~3 weeks.
      const decisionDays = 1 + Math.floor(Math.pow(rand(), 2.2) * 20);
      const decidedAt = addDays(claimCreated, decisionDays);
      const quantity = pickWeighted(rand, [1, 2, 4], [60, 32, 8]);

      if (decidedAt > today) {
        claims.push({
          brand, createdAt: claimCreated, decidedAt: null, quantity, rejectionReason: null,
          status: differenceInCalendarDays(today, claimCreated) <= 2 && rand() < 0.6 ? 'unacknowledged' : 'pending',
        });
        continue;
      }

      const approved = rand() < profile.approveRate;
      claims.push({
        brand,
        createdAt: claimCreated,
        decidedAt,
        quantity,
        status: approved ? 'approved' : 'rejected',
        rejectionReason: approved
          ? null
          : pickWeighted(rand, [...REJECTION_REASONS], [40, 30, 18, 12]),
      });
    }
  }

  // Brand capture was only added recently, so older records have no brand. Simulate that by
  // blanking the brand on the first half of warranties (by count) and on claims filed before then.
  warranties.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  const brandCaptureStart = warranties[Math.floor(warranties.length / 2)].createdAt;
  warranties.forEach((w) => { if (w.createdAt < brandCaptureStart) w.brand = NOT_RECORDED; });
  claims.forEach((c) => { if (c.createdAt < brandCaptureStart) c.brand = NOT_RECORDED; });

  return { warranties, claims };
};

// ── Real-data fixture ────────────────────────────────────────────────────────

/** Compact rows written by scripts/build-dashboard-fixture.py. Brands are already normalised (null = not recorded). */
interface DashboardFixture {
  warranties: [createdAt: string, brand: string | null][];
  claims: [
    createdAt: string,
    resolvedAt: string | null,
    status: ClaimStatus,
    brand: string | null,
    quantity: number | null,
    rejectionReason: string | null,
  ][];
}

// import.meta.glob resolves to {} when the (gitignored) fixture is absent, so builds never depend on it.
const fixtureModules = import.meta.glob<{ default: DashboardFixture }>('../mocks/dashboardFixture.json');

const fromFixture = (f: DashboardFixture): Records => ({
  warranties: f.warranties.map(([createdAt, brand]) => ({ createdAt: new Date(createdAt), brand: brand ?? NOT_RECORDED })),
  claims: f.claims.map(([createdAt, resolvedAt, status, brand, quantity, rejectionReason]) => ({
    createdAt: new Date(createdAt),
    decidedAt: resolvedAt ? new Date(resolvedAt) : null,
    status,
    brand: brand ?? NOT_RECORDED,
    quantity: quantity ?? 0,
    rejectionReason,
  })),
});

let recordsPromise: Promise<Records> | null = null;

const loadRecords = () =>
  (recordsPromise ??= (async () => {
    const loadFixture = Object.values(fixtureModules)[0];
    return loadFixture ? fromFixture((await loadFixture()).default) : generateRecords(endOfDay(new Date()));
  })());

// ── Aggregation (mirrors what the BE will compute) ───────────────────────────

const median = (values: number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const TOP_BRANDS_IN_MIX = 5;

const aggregate = (
  { warranties, claims }: Records,
  range: DateRange,
  previousRange: DateRange | null,
): DashboardData => {
  const cur = toInterval(range);
  const inCur = (d: Date) => isWithinInterval(d, cur);
  // No comparison period ("All time"): nothing counts as previous, and previous figures are null.
  const prev = previousRange ? toInterval(previousRange) : null;
  const inPrev = (d: Date) => !!prev && isWithinInterval(d, prev);
  const ifCompared = <T,>(v: T) => (previousRange ? v : null);

  const warrantiesCur = warranties.filter((w) => inCur(w.createdAt));
  const warrantiesPrev = warranties.filter((w) => inPrev(w.createdAt));
  const claimsCur = claims.filter((c) => inCur(c.createdAt));
  const claimsPrev = claims.filter((c) => inPrev(c.createdAt));
  // Outcome metrics (approvals, rejections, resolution time) use claims *resolved* in the period.
  const resolvedCur = claims.filter((c) => c.decidedAt && inCur(c.decidedAt));
  const resolvedPrev = claims.filter((c) => c.decidedAt && inPrev(c.decidedAt));

  const medianDays = (list: MockClaim[]) =>
    median(list.map((c) => Math.max(0, differenceInCalendarDays(c.decidedAt!, c.createdAt))));

  // Brand rows
  const brandNames = Array.from(new Set([...warranties, ...claims].map((x) => x.brand)));
  const isRecorded = (x: { brand: string }) => x.brand !== NOT_RECORDED;
  const recordedCur = warrantiesCur.filter(isRecorded).length;
  const recordedPrev = warrantiesPrev.filter(isRecorded).length;
  const firstRecorded = warranties.find(isRecorded);
  const countBy = <T extends { brand: string }>(list: T[], pred: (x: T) => boolean = () => true) => {
    const m = new Map<string, number>();
    list.forEach((x) => pred(x) && m.set(x.brand, (m.get(x.brand) ?? 0) + 1));
    return m;
  };
  const wCur = countBy(warrantiesCur);
  const wPrev = countBy(warrantiesPrev);
  const cCur = countBy(claimsCur);
  const approvedBy = countBy(resolvedCur, (c) => c.status === 'approved');
  const rejectedBy = countBy(resolvedCur, (c) => c.status === 'rejected');
  const tyresBy = new Map<string, number>();
  resolvedCur
    .filter((c) => c.status === 'approved')
    .forEach((c) => tyresBy.set(c.brand, (tyresBy.get(c.brand) ?? 0) + c.quantity));

  const allRows: BrandRow[] = brandNames
    .map((brand) => {
      const w = wCur.get(brand) ?? 0;
      const approved = approvedBy.get(brand) ?? 0;
      const rejected = rejectedBy.get(brand) ?? 0;
      const c = cCur.get(brand) ?? 0;
      return {
        brand,
        warranties: w,
        previousWarranties: wPrev.get(brand) ?? 0,
        share: brand !== NOT_RECORDED && recordedCur ? w / recordedCur : 0,
        claims: c,
        claimsPer100: w ? (c / w) * 100 : null,
        approved,
        rejected,
        tyresReplaced: tyresBy.get(brand) ?? 0,
        approvalRate: approved + rejected ? approved / (approved + rejected) : null,
      };
    })
    .sort((a, b) => b.warranties - a.warranties || a.brand.localeCompare(b.brand));
  // Same rule as the backend: drop brands with nothing in either period (e.g. only seen long ago).
  const active = (r: BrandRow) => r.warranties + r.previousWarranties + r.claims + r.approved + r.rejected > 0;
  const notRecordedRow = allRows.find((r) => r.brand === NOT_RECORDED && active(r)) ?? null;
  const brands = allRows.filter((r) => r.brand !== NOT_RECORDED && active(r));

  // Brand mix over time – weekly buckets for short ranges, monthly otherwise.
  const bucket: 'week' | 'month' = differenceInCalendarDays(cur.end, cur.start) <= 62 ? 'week' : 'month';
  const hasMissing = recordedCur < warrantiesCur.length;
  const withWarranties = brands.filter((b) => b.warranties > 0);
  const series = [
    ...withWarranties.slice(0, TOP_BRANDS_IN_MIX).map((b) => b.brand),
    ...(withWarranties.length > TOP_BRANDS_IN_MIX ? ['Other'] : []),
    ...(hasMissing ? [NOT_RECORDED] : []),
  ];
  const topSet = new Set(series);
  const { buckets, indexOf } = buildBuckets(cur, bucket);
  const points: BrandMixPoint[] = buckets.map((b) => {
    const p: BrandMixPoint = { label: b.label };
    series.forEach((name) => (p[name] = 0));
    return p;
  });
  warrantiesCur.forEach((w) => {
    const i = indexOf(w.createdAt);
    if (i === undefined) return;
    const key = topSet.has(w.brand) ? w.brand : 'Other'; // NOT_RECORDED is in topSet when present
    (points[i][key] as number)++;
  });

  // Rejection reasons
  const reasonCounts = new Map<string, number>();
  resolvedCur
    .filter((c) => c.status === 'rejected' && c.rejectionReason)
    .forEach((c) => reasonCounts.set(c.rejectionReason!, (reasonCounts.get(c.rejectionReason!) ?? 0) + 1));

  return {
    range,
    previousRange,
    brandCoverage: {
      recordedSince: firstRecorded ? startOfDay(firstRecorded.createdAt) : null,
      current: { recorded: recordedCur, total: warrantiesCur.length },
      previous: { recorded: recordedPrev, total: warrantiesPrev.length },
    },
    notRecorded: notRecordedRow,
    kpis: {
      warranties: { current: warrantiesCur.length, previous: ifCompared(warrantiesPrev.length) },
      claims: { current: claimsCur.length, previous: ifCompared(claimsPrev.length) },
      claimOutcomes: {
        approved: claimsCur.filter((c) => c.status === 'approved').length,
        rejected: claimsCur.filter((c) => c.status === 'rejected').length,
        open: claimsCur.filter((c) => c.status !== 'approved' && c.status !== 'rejected').length,
      },
      medianDaysToResolution: { current: medianDays(resolvedCur), previous: ifCompared(medianDays(resolvedPrev)) },
    },
    brands,
    brandMix: { bucket, series, points },
    rejectionReasons: Array.from(reasonCounts, ([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count),
  };
};

// Simulated network latency so loading states are visible in the demo.
const latency = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const fetchDashboard = async (range: DateRange, previousRange: DateRange | null): Promise<DashboardData> => {
  await latency(450);
  return aggregate(await loadRecords(), range, previousRange);
};

/** Warranties registered vs claims filed per day/week/month. Separate call so toggling granularity is cheap. */
export const fetchTrend = async (range: DateRange, granularity: Granularity): Promise<TrendData> => {
  await latency(250);
  const { warranties, claims } = await loadRecords();
  const cur = toInterval(range);
  const { buckets, indexOf } = buildBuckets(cur, granularity);
  const points: TrendPoint[] = buckets.map((b) => ({ ...b, warranties: 0, claims: 0 }));
  warranties.forEach((w) => {
    const i = isWithinInterval(w.createdAt, cur) ? indexOf(w.createdAt) : undefined;
    if (i !== undefined) points[i].warranties++;
  });
  claims.forEach((c) => {
    const i = isWithinInterval(c.createdAt, cur) ? indexOf(c.createdAt) : undefined;
    if (i !== undefined) points[i].claims++;
  });
  return { granularity, points };
};
