// View-model types for the master dashboard. Both the real API (dashboardApi.ts, which maps the
// backend's snake_case JSON into these) and the mock (dashboardMock.ts) produce these shapes.

/** Bucket label for warranties/claims with no brand recorded (brand capture only started recently). */
export const NOT_RECORDED = 'Not recorded';

/** Earliest date with data (first warranties, Aug 2025) – the date picker disables anything before it. */
export const DATA_START = new Date(2025, 7, 1);

export interface DateRange {
  from: Date;
  to: Date;
}

export interface Comparison {
  current: number | null;
  previous: number | null;
}

export interface BrandRow {
  brand: string;
  warranties: number;
  previousWarranties: number;
  share: number;              // 0–1, share of warranties *with a brand recorded* in range
  claims: number;
  claimsPer100: number | null; // claims filed per 100 warranties registered, same period
  approved: number;
  rejected: number;
  tyresReplaced: number;      // sum of tyre quantity on approved claims
  approvalRate: number | null; // approved / decided, 0–1
}

export interface BrandMixPoint {
  label: string;
  [brand: string]: string | number;
}

/** How many warranties have a brand recorded. Brand capture only started recently, so older ones don't. */
export interface BrandCoverage {
  recordedSince: Date | null;          // earliest warranty with a brand – when brand capture started
  current: { recorded: number; total: number };
  previous: { recorded: number; total: number };
}

/** Where the claims filed in the period stand now – sums to kpis.claims.current. */
export interface ClaimOutcomes {
  approved: number;
  rejected: number;
  open: number; // unacknowledged or pending
}

export interface DashboardData {
  range: DateRange;
  /** null when there is nothing to compare with ("All time"); all previous figures are then null. */
  previousRange: DateRange | null;
  brandCoverage: BrandCoverage;
  /** Warranties/claims with no brand. Kept out of `brands` so shares and rankings only use real brands. */
  notRecorded: BrandRow | null;
  kpis: {
    warranties: Comparison;
    claims: Comparison;
    claimOutcomes: ClaimOutcomes;
    medianDaysToResolution: Comparison; // filed → approved/rejected, for claims resolved in the period
  };
  brands: BrandRow[];
  brandMix: {
    bucket: 'week' | 'month';
    series: string[];                // top brands + "Other" (+ "Not recorded" when any are missing)
    points: BrandMixPoint[];
  };
  rejectionReasons: { reason: string; count: number }[];
}

export type Granularity = 'day' | 'week' | 'month';

export interface TrendPoint {
  label: string;         // axis label, e.g. "5 Oct"
  tooltipLabel: string;  // full bucket description, e.g. "5 – 11 Oct 2026"
  partial: boolean;      // bucket is cut off by the range start/end
  warranties: number;
  claims: number;
}

export interface TrendData {
  granularity: Granularity;
  points: TrendPoint[];
}
