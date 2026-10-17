// Day/week/month bucketing for the dashboard charts, in the viewer's local time (Malaysia).
// Weeks start on Monday, matching the backend's Postgres date_trunc('week').
import {
  eachDayOfInterval, eachMonthOfInterval, eachWeekOfInterval, endOfDay, endOfMonth, endOfWeek, format,
  startOfDay, startOfMonth, startOfWeek,
} from 'date-fns';
import type { DateRange, Granularity } from './dashboardTypes';

type Interval = { start: Date; end: Date };

export const toInterval = (r: DateRange): Interval => ({ start: startOfDay(r.from), end: endOfDay(r.to) });

/** Splits an interval into day/week/month buckets, clamped to the interval at both ends. */
export const buildBuckets = (cur: Interval, g: Granularity) => {
  const bucketStart = (d: Date) =>
    g === 'day' ? startOfDay(d) : g === 'week' ? startOfWeek(d, { weekStartsOn: 1 }) : startOfMonth(d);
  const bucketEnd = (d: Date) =>
    g === 'day' ? endOfDay(d) : g === 'week' ? endOfWeek(d, { weekStartsOn: 1 }) : endOfMonth(d);
  const starts = g === 'day'
    ? eachDayOfInterval(cur)
    : g === 'week'
      ? eachWeekOfInterval(cur, { weekStartsOn: 1 })
      : eachMonthOfInterval(cur);

  const buckets = starts.map((s) => {
    const from = s < cur.start ? cur.start : s;
    const rawEnd = bucketEnd(s);
    const to = rawEnd > cur.end ? cur.end : rawEnd;
    const partial = g !== 'day' && (s < cur.start || rawEnd > cur.end);
    const label = format(from, g === 'month' ? "MMM ''yy" : 'd MMM');
    const tooltipLabel = g === 'day'
      ? format(from, 'EEE, d MMM yyyy')
      : g === 'month' && !partial
        ? format(from, 'MMMM yyyy')
        : `${format(from, 'd MMM')} – ${format(to, 'd MMM yyyy')}`;
    return { key: format(s, 'yyyy-MM-dd'), label, tooltipLabel, partial };
  });

  const indexByStart = new Map(starts.map((s, i) => [s.getTime(), i]));
  const indexOf = (d: Date) => indexByStart.get(bucketStart(d).getTime());
  return { buckets, indexOf };
};
