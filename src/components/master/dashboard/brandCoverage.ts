import type { BrandCoverage } from '@/services/dashboardTypes';

// Brand capture only started recently, so older warranties have no brand. Below this share of
// warranties with a brand, per-brand comparisons stop being meaningful and we show "—" instead.
const RELIABLE_COVERAGE = 0.95;

const CHANGE_NA_HINT =
  'Not comparable – brand was not recorded for many warranties in one of the two periods.';
const NO_COMPARISON_HINT = 'No comparison – "All time" has no previous period.';
export const RATE_NA_HINT =
  'Not shown – many warranties in this period have no brand, which would inflate claims per 100.';

const ratio = ({ recorded, total }: { recorded: number; total: number }) => (total ? recorded / total : 1);

export interface BrandFlags {
  /** False for "All time" – there is no previous period, so nothing shows a change. */
  hasComparison: boolean;
  /** Share of warranties in the period that have a brand (0–1). */
  coverage: number;
  /** Brand change vs previous period is only fair when both periods have (almost) full brand data. */
  changeComparable: boolean;
  /** Why the change column shows "—" when it isn't comparable. */
  changeHint: string;
  /** Claims per 100 warranties per brand is skewed when many warranties are missing a brand. */
  ratesReliable: boolean;
}

export const brandFlags = (c: BrandCoverage, hasComparison: boolean): BrandFlags => ({
  hasComparison,
  coverage: ratio(c.current),
  changeComparable:
    hasComparison && ratio(c.current) >= RELIABLE_COVERAGE && ratio(c.previous) >= RELIABLE_COVERAGE,
  changeHint: hasComparison ? CHANGE_NA_HINT : NO_COMPARISON_HINT,
  ratesReliable: ratio(c.current) >= RELIABLE_COVERAGE,
});
