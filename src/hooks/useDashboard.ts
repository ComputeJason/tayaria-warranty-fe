import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  differenceInCalendarDays, format, isValid, parseISO, startOfMonth, startOfYear, subDays, subMonths, subYears,
} from 'date-fns';
import { DATA_START, type DateRange, type Granularity } from '@/services/dashboardTypes';
import * as apiSource from '@/services/dashboardApi';
import * as mockSource from '@/services/dashboardMock';

/**
 * Where dashboard data comes from. `VITE_DASHBOARD_SOURCE=mock` (in .env.local) switches to the
 * local mock – honoured in dev only, so production builds always use the real API.
 */
export const DASHBOARD_SOURCE: 'api' | 'mock' =
  import.meta.env.DEV && import.meta.env.VITE_DASHBOARD_SOURCE === 'mock' ? 'mock' : 'api';

const { fetchDashboard, fetchTrend } = DASHBOARD_SOURCE === 'mock' ? mockSource : apiSource;

export type RangePreset = 'this-month' | '3m' | '6m' | '12m' | 'ytd' | 'all' | 'custom';

export const RANGE_PRESETS: { value: Exclude<RangePreset, 'custom'>; label: string }[] = [
  { value: 'this-month', label: 'This month' },
  { value: '3m', label: 'Last 3 months' },
  { value: '6m', label: 'Last 6 months' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'ytd', label: 'Year to date' },
  { value: 'all', label: 'All time' },
];

const DEFAULT_PRESET: RangePreset = 'this-month';
const ISO = 'yyyy-MM-dd';

// "Last N months" = the current month-to-date plus the N-1 full months before it.
// The comparison period is the N *complete* calendar months before that (a full previous year for
// YTD), e.g. on 16 Oct "Last 3 months" = 1 Aug – 16 Oct, compared with 1 May – 31 Jul.
// "All time" runs from the first data (DATA_START) and has nothing before it to compare with.
const resolvePreset = (
  preset: Exclude<RangePreset, 'custom'>,
  today: Date,
): { range: DateRange; previousRange: DateRange | null } => {
  if (preset === 'all') return { range: { from: DATA_START, to: today }, previousRange: null };
  const months = { 'this-month': 1, '3m': 3, '6m': 6, '12m': 12 } as const;
  const from = preset === 'ytd' ? startOfYear(today) : startOfMonth(subMonths(today, months[preset] - 1));
  const previousFrom = preset === 'ytd' ? subYears(from, 1) : subMonths(from, months[preset]);
  return { range: { from, to: today }, previousRange: { from: previousFrom, to: subDays(from, 1) } };
};

// Custom ranges compare against the exact same number of days immediately before,
// e.g. a 32-day range is compared with the 32 days ending the day before it starts.
const resolveCustom = (range: DateRange): { range: DateRange; previousRange: DateRange | null } => {
  const days = differenceInCalendarDays(range.to, range.from) + 1;
  return { range, previousRange: { from: subDays(range.from, days), to: subDays(range.from, 1) } };
};

const parseDate = (s: string | null) => {
  if (!s) return null;
  const d = parseISO(s);
  return isValid(d) ? d : null;
};

/** Date range state, persisted in the URL (?range=6m or ?from=2026-01-01&to=2026-03-31). */
export const useDashboardRange = () => {
  const [params, setParams] = useSearchParams();
  const rangeParam = params.get('range');
  const fromParam = params.get('from');
  const toParam = params.get('to');

  const resolved = useMemo(() => {
    const today = new Date();
    const from = parseDate(fromParam);
    const to = parseDate(toParam);
    if (from && to && from <= to) {
      return { preset: 'custom' as RangePreset, ...resolveCustom({ from, to }) };
    }
    const preset = RANGE_PRESETS.some((p) => p.value === rangeParam)
      ? (rangeParam as Exclude<RangePreset, 'custom'>)
      : (DEFAULT_PRESET as Exclude<RangePreset, 'custom'>);
    return { preset: preset as RangePreset, ...resolvePreset(preset, today) };
  }, [rangeParam, fromParam, toParam]);

  const setPreset = (preset: Exclude<RangePreset, 'custom'>) =>
    setParams(preset === DEFAULT_PRESET ? {} : { range: preset }, { replace: true });

  const setCustom = (range: DateRange) =>
    setParams({ from: format(range.from, ISO), to: format(range.to, ISO) }, { replace: true });

  return { ...resolved, setPreset, setCustom };
};

export const useDashboardData = (range: DateRange, previousRange: DateRange | null) =>
  useQuery({
    // The comparison period is part of the key: e.g. "This month" and a custom range with the same
    // dates compare against different periods, so they must not share a cached result.
    queryKey: [
      'master-dashboard',
      format(range.from, ISO),
      format(range.to, ISO),
      previousRange ? `${format(previousRange.from, ISO)}_${format(previousRange.to, ISO)}` : 'none',
    ],
    queryFn: () => fetchDashboard(range, previousRange),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });

// ── Trend granularity ────────────────────────────────────────────────────────

export const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

/** Which granularities make sense for a range (avoids e.g. 365 daily bars, or a single monthly bar). */
export const granularityOptions = (range: DateRange) => {
  const days = differenceInCalendarDays(range.to, range.from) + 1;
  const allowed: Granularity[] = [];
  if (days <= 92) allowed.push('day');
  if (days >= 14) allowed.push('week');
  if (days >= 45) allowed.push('month');
  if (!allowed.length) allowed.push('day');
  const preferred: Granularity = days <= 31 ? 'day' : days <= 92 ? 'week' : 'month';
  return { allowed, preferred };
};

export const useTrendData = (range: DateRange, granularity: Granularity) =>
  useQuery({
    queryKey: ['master-dashboard-trend', format(range.from, ISO), format(range.to, ISO), granularity],
    queryFn: () => fetchTrend(range, granularity),
    placeholderData: (prev) => prev,
    staleTime: 60_000,
  });
