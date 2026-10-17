import React from 'react';
import { format } from 'date-fns';
import { Info } from 'lucide-react';
import type { BrandCoverage, DateRange } from '@/services/dashboardTypes';
import { fmtInt, fmtPct } from './format';
import type { BrandFlags } from './brandCoverage';

interface Props {
  coverage: BrandCoverage;
  flags: BrandFlags;
  range: DateRange;
  onViewSinceStart: (range: DateRange) => void;
}

/** Explains missing brand data above the brand sections. Renders nothing when coverage is complete. */
const BrandCoverageNotice: React.FC<Props> = ({ coverage, flags, range, onViewSinceStart }) => {
  const { recorded, total } = coverage.current;
  const since = coverage.recordedSince;
  const previousIncomplete = coverage.previous.recorded < coverage.previous.total;
  if (recorded === total && !previousIncomplete) return null;

  // Offer a one-click range that starts when brand capture began, if the current range starts earlier.
  // If the whole range is before that date, jump to "since then until today" instead.
  const canJump = !!since && since > range.from;
  const jumpTo = since && since <= range.to ? range.to : new Date();
  const sinceText = since ? format(since, 'd MMM yyyy') : null;

  let message: React.ReactNode;
  if (recorded === total) {
    message = (
      <>Brand was only recorded from {sinceText}, so brand changes vs the previous period aren't shown.</>
    );
  } else if (recorded === 0) {
    message = (
      <>
        None of the {fmtInt(total)} warranties in this period have a brand – brand was only recorded
        {sinceText ? <> from {sinceText}</> : ' recently'}.
      </>
    );
  } else {
    message = (
      <>
        Brand recorded for <span className="font-semibold text-white">{fmtInt(recorded)} of {fmtInt(total)}</span>{' '}
        warranties ({fmtPct(flags.coverage)}) – it was only captured from {sinceText}. Brand shares below
        are based on the {fmtInt(recorded)} with a brand.
      </>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-sky-500/25 bg-sky-500/[0.07] px-4 py-3">
      <div className="flex items-start gap-3">
        <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="text-sm text-gray-300">{message}</p>
      </div>
      {canJump && (
        <button
          type="button"
          onClick={() => onViewSinceStart({ from: since, to: jumpTo })}
          className="self-start sm:self-auto whitespace-nowrap rounded-md border border-sky-500/30 px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/10"
        >
          View from {format(since, 'd MMM yyyy')}
        </button>
      )}
    </div>
  );
};

export default BrandCoverageNotice;
