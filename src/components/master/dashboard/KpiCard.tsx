import React from 'react';
import { ArrowDownRight, ArrowUpRight, Info, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface KpiDelta {
  value: number;            // signed raw change, decides the arrow
  text: string;             // e.g. "+38", "−0.5 days", "+2.1 pts"
  goodWhen: 'up' | 'down' | 'neutral';
}

interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
  delta: KpiDelta | null;
  /** e.g. "vs 123 prev."; omitted when there is no comparison period. */
  previousText?: string;
  /** Extra detail under the comparison line, e.g. the claim outcome breakdown. */
  children?: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, hint, delta, previousText, children }) => {
  const tone = !delta || delta.value === 0 || delta.goodWhen === 'neutral'
    ? 'neutral'
    : (delta.value > 0) === (delta.goodWhen === 'up') ? 'good' : 'bad';
  const Arrow = !delta || delta.value === 0 ? Minus : delta.value > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="h-full bg-tayaria-darkgray border-tayaria-gray">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-1.5 text-gray-400 text-[11px] sm:text-xs font-medium uppercase tracking-wider leading-tight">
          {label}
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" aria-label={`About ${label}`} className="text-gray-600 hover:text-gray-300">
                <Info className="h-3.5 w-3.5 shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs normal-case tracking-normal">{hint}</TooltipContent>
          </Tooltip>
        </div>

        <div className="mt-3 text-2xl sm:text-3xl font-bold tabular-nums text-white">
          {value}
        </div>

        {(delta || previousText) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
          {delta && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold tabular-nums',
                tone === 'good' && 'text-green-400',
                tone === 'bad' && 'text-red-400',
                tone === 'neutral' && 'text-gray-400',
              )}
            >
              <Arrow className="h-3 w-3" />
              {delta.text}
            </span>
          )}
          {previousText && <span className="text-gray-500">{previousText}</span>}
        </div>
        )}

        {children && <div className="mt-3">{children}</div>}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
