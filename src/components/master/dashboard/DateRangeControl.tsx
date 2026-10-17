import React, { useEffect, useState } from 'react';
import { CalendarDays, Check, ChevronDown } from 'lucide-react';
import type { DateRange as DayPickerRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { RANGE_PRESETS, type RangePreset } from '@/hooks/useDashboard';
import { DATA_START, type DateRange } from '@/services/dashboardTypes';
import { fmtRange } from './format';

interface DateRangeControlProps {
  preset: RangePreset;
  range: DateRange;
  onPreset: (preset: Exclude<RangePreset, 'custom'>) => void;
  onCustom: (range: DateRange) => void;
}

const DateRangeControl: React.FC<DateRangeControlProps> = ({ preset, range, onPreset, onCustom }) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DayPickerRange | undefined>({ from: range.from, to: range.to });

  // Reset the draft selection to the applied range whenever the popover opens.
  useEffect(() => {
    if (open) setDraft({ from: range.from, to: range.to });
  }, [open, range.from, range.to]);

  const label = preset === 'custom'
    ? fmtRange(range)
    : RANGE_PRESETS.find((p) => p.value === preset)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-tayaria-gray bg-tayaria-darkgray px-3 py-2 text-sm text-white hover:border-gray-500 transition-colors"
        >
          <CalendarDays className="h-4 w-4 text-gray-400" />
          {label}
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-auto max-w-[calc(100vw-2rem)] p-0 bg-tayaria-darkgray border-tayaria-gray text-white"
      >
        <div className="flex flex-col md:flex-row">
          <div className="flex flex-row flex-wrap md:flex-col gap-1 p-2 border-b md:border-b-0 md:border-r border-tayaria-gray md:w-44">
            {RANGE_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => { onPreset(p.value); setOpen(false); }}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm text-left transition-colors',
                  preset === p.value ? 'bg-tayaria-yellow/15 text-tayaria-yellow' : 'text-gray-300 hover:bg-white/5',
                )}
              >
                {p.label}
                {preset === p.value && <Check className="h-3.5 w-3.5 hidden md:block" />}
              </button>
            ))}
          </div>

          <div>
            <Calendar
              mode="range"
              selected={draft}
              // Clicks always go start → end: once a range is complete, the next click starts a new
              // one (react-day-picker's default would extend the existing range instead).
              onSelect={(_, day) =>
                setDraft((d) => {
                  if (!d?.from || d.to) return { from: day, to: undefined };
                  return day < d.from ? { from: day, to: d.from } : { from: d.from, to: day };
                })
              }
              numberOfMonths={isMobile ? 1 : 2}
              defaultMonth={draft?.from ?? range.from}
              disabled={{ before: DATA_START, after: new Date() }}
              fromDate={DATA_START}
              toDate={new Date()}
              showOutsideDays={false}
              classNames={{
                // Default shadcn styling paints every in-range day solid orange; keep solid only for
                // the start/end and tint the days in between.
                cell: 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-tayaria-yellow/15 [&:has(.day-range-start)]:rounded-l-md [&:has(.day-range-end)]:rounded-r-md',
                day_range_start: 'day-range-start',
                day_range_middle: '!bg-transparent !text-white hover:!bg-white/10',
                day_today: 'text-tayaria-yellow font-semibold',
              }}
            />
            <div className="flex items-center justify-between gap-3 border-t border-tayaria-gray px-3 py-2">
              <span className="text-xs text-gray-400">
                {draft?.from && draft?.to ? fmtRange({ from: draft.from, to: draft.to }) : 'Pick a start and end date'}
              </span>
              <Button
                size="sm"
                disabled={!draft?.from || !draft?.to}
                onClick={() => {
                  if (draft?.from && draft?.to) {
                    onCustom({ from: draft.from, to: draft.to });
                    setOpen(false);
                  }
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeControl;
