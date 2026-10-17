import { format, isSameYear } from 'date-fns';
import type { DateRange } from '@/services/dashboardTypes';

const intFmt = new Intl.NumberFormat('en-MY');

export const fmtInt = (n: number | null | undefined) => (n == null ? '—' : intFmt.format(n));

export const fmtPct = (ratio: number | null | undefined, digits = 0) =>
  ratio == null ? '—' : `${(ratio * 100).toFixed(digits)}%`;

export const fmtDays = (n: number | null | undefined) =>
  n == null ? '—' : n === 0 ? 'Same day' : `${Number.isInteger(n) ? n : n.toFixed(1)} ${n === 1 ? 'day' : 'days'}`;

export const fmtRange = ({ from, to }: DateRange) => {
  const sameYear = isSameYear(from, to);
  return `${format(from, sameYear ? 'd MMM' : 'd MMM yyyy')} – ${format(to, 'd MMM yyyy')}`;
};

/** Signed number with a real minus sign, e.g. "+12", "−3", "0". */
export const signed = (n: number, digits = 0) => {
  const v = Number(n.toFixed(digits));
  if (v === 0) return (0).toFixed(digits);
  return `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(digits)}`;
};

// Categorical palette for brand series on the dark theme. First slot is Tayaria orange.
export const SERIES_COLORS = ['#FFA500', '#60A5FA', '#34D399', '#F472B6', '#A78BFA'];
export const OTHER_COLOR = '#6B7280';
// Deliberately low-contrast: warranties with no brand are context, not a brand to compare.
export const NOT_RECORDED_COLOR = '#3A3A3A';
