import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TooltipProps } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { GRANULARITIES, granularityOptions, useTrendData } from '@/hooks/useDashboard';
import type { DateRange, Granularity, TrendPoint } from '@/services/dashboardTypes';
import { fmtInt } from './format';

const WARRANTY_COLOR = '#FFA500';
const CLAIM_COLOR = '#60A5FA';
const SYNC_ID = 'dashboard-trend';
const AVERAGE_COLOR = 'rgba(229, 231, 235, 0.7)';

/**
 * Mean per bucket over the *complete* buckets only – a part-week/month cut off by the range would
 * drag the average down. Null when fewer than two complete buckets, where an average says nothing.
 */
const averageOf = (points: TrendPoint[], key: 'warranties' | 'claims') => {
  const complete = points.filter((p) => !p.partial);
  if (complete.length < 2) return null;
  return complete.reduce((sum, p) => sum + p[key], 0) / complete.length;
};

const fmtAverage = (n: number) => (n < 10 ? n.toFixed(1) : Math.round(n).toLocaleString('en-MY'));

// The charts share the x-axis via syncId; the tooltip shows both numbers, so only the hovered chart renders it.
const TrendTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  const p = payload?.[0]?.payload as TrendPoint | undefined;
  if (!active || !p) return null;
  return (
    <div className="rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-white">
        {p.tooltipLabel}
        {p.partial && <span className="ml-1 font-normal text-gray-500">(partial)</span>}
      </p>
      <p className="flex items-center gap-2 text-gray-300">
        <span className="h-2 w-2 rounded-full" style={{ background: WARRANTY_COLOR }} />
        Warranties <span className="ml-auto pl-4 font-semibold tabular-nums text-white">{fmtInt(p.warranties)}</span>
      </p>
      <p className="flex items-center gap-2 text-gray-300">
        <span className="h-2 w-2 rounded-full" style={{ background: CLAIM_COLOR }} />
        Claims <span className="ml-auto pl-4 font-semibold tabular-nums text-white">{fmtInt(p.claims)}</span>
      </p>
    </div>
  );
};

const SeriesChart: React.FC<{
  points: TrendPoint[];
  dataKey: 'warranties' | 'claims';
  color: string;
  height: number;
  showXAxis: boolean;
  showTooltip: boolean;
  onHover: (hovering: boolean) => void;
  average: number | null;
}> = ({ points, dataKey, color, height, showXAxis, showTooltip, onHover, average }) => (
  <div style={{ height }} onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={points} syncId={SYNC_ID} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#2a2a2a" />
        <XAxis
          dataKey="label"
          hide={!showXAxis}
          tick={{ fill: '#9CA3AF', fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: '#333' }}
          interval="preserveStartEnd"
          minTickGap={16}
        />
        <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} width={44} />
        <Tooltip content={showTooltip ? <TrendTooltip /> : () => null} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
        <Bar dataKey={dataKey} maxBarSize={40} radius={[2, 2, 0, 0]}>
          {/* Partial buckets (cut off by the range) are dimmed so a short last week/month isn't misread as a drop. */}
          {points.map((p, i) => <Cell key={i} fill={color} fillOpacity={p.partial ? 0.45 : 1} />)}
        </Bar>
        {average != null && (
          <ReferenceLine y={average} stroke={AVERAGE_COLOR} strokeDasharray="4 4" strokeWidth={1.5} ifOverflow="extendDomain" />
        )}
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const SeriesHeader: React.FC<{
  label: string;
  color: string;
  total: number;
  average: number | null;
  granularity: Granularity;
}> = ({ label, color, total, average, granularity }) => (
  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400 mb-1">
    <span className="h-2 w-2 rounded-full" style={{ background: color }} />
    {label}
    <span className="font-semibold tabular-nums text-white">{fmtInt(total)}</span>
    {average != null && (
      <span
        className="ml-2 inline-flex items-center gap-1.5 cursor-help"
        title={`Average per complete ${granularity} in this range (partial ${granularity}s excluded)`}
      >
        <span className="w-4 border-t-[1.5px] border-dashed" style={{ borderColor: AVERAGE_COLOR }} />
        avg <span className="font-semibold tabular-nums text-gray-200">{fmtAverage(average)}</span> / {granularity}
      </span>
    )}
  </div>
);

const TrendCharts: React.FC<{ range: DateRange }> = ({ range }) => {
  const { allowed, preferred } = granularityOptions(range);
  const [chosen, setChosen] = useState<Granularity | null>(null);
  const [hovered, setHovered] = useState<'warranties' | 'claims' | null>(null);
  const hoverProps = (key: 'warranties' | 'claims') => ({
    showTooltip: hovered === key,
    onHover: (on: boolean) => setHovered(on ? key : null),
  });
  // Fall back to the sensible default when the user's pick doesn't fit the current range.
  const granularity = chosen && allowed.includes(chosen) ? chosen : preferred;
  const { data, isLoading, isError } = useTrendData(range, granularity);

  const points = data?.points ?? [];
  const averages = { warranties: averageOf(points, 'warranties'), claims: averageOf(points, 'claims') };
  const totals = points.reduce(
    (t, p) => ({ warranties: t.warranties + p.warranties, claims: t.claims + p.claims }),
    { warranties: 0, claims: 0 },
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-white font-semibold text-base">Warranties & claims over time</h2>
          <p className="text-gray-500 text-xs mt-0.5">Registered vs filed per {granularity}. Hover to compare.</p>
        </div>
        <div role="radiogroup" aria-label="Group by" className="flex self-start shrink-0 gap-1 rounded-lg border border-tayaria-gray bg-tayaria-black p-1">
          {GRANULARITIES.map((g) => {
            const enabled = allowed.includes(g.value);
            return (
              <button
                key={g.value}
                type="button"
                role="radio"
                aria-checked={granularity === g.value}
                disabled={!enabled}
                title={enabled ? undefined : `Not available for this date range`}
                onClick={() => setChosen(g.value)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                  granularity === g.value ? 'bg-tayaria-yellow text-black' : 'text-gray-400 hover:text-white',
                  !enabled && 'opacity-30 cursor-not-allowed hover:text-gray-400',
                )}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-[330px] rounded-md bg-white/[0.04]" />
      ) : isError || !data ? (
        <p className="py-16 text-center text-sm text-gray-500">Couldn't load the trend.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <SeriesHeader label="Warranties registered" color={WARRANTY_COLOR} total={totals.warranties} average={averages.warranties} granularity={granularity} />
            <SeriesChart points={data.points} dataKey="warranties" color={WARRANTY_COLOR} height={170} showXAxis={false} average={averages.warranties} {...hoverProps('warranties')} />
          </div>
          <div>
            <SeriesHeader label="Claims filed" color={CLAIM_COLOR} total={totals.claims} average={averages.claims} granularity={granularity} />
            <SeriesChart points={data.points} dataKey="claims" color={CLAIM_COLOR} height={140} showXAxis average={averages.claims} {...hoverProps('claims')} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendCharts;
