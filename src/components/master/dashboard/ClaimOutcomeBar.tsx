import React from 'react';
import type { ClaimOutcomes } from '@/services/dashboardTypes';
import { fmtInt } from './format';

// Same colours as the status badges on the Manage Claims page.
const SEGMENTS: { key: keyof ClaimOutcomes; label: string; bar: string; dot: string }[] = [
  { key: 'approved', label: 'approved', bar: 'bg-green-500/80', dot: 'bg-green-500' },
  { key: 'rejected', label: 'rejected', bar: 'bg-red-500/80', dot: 'bg-red-500' },
  { key: 'open', label: 'open', bar: 'bg-yellow-500/70', dot: 'bg-yellow-500' },
];

/** Where the claims filed in the period stand now: a proportional bar plus a one-line legend. */
const ClaimOutcomeBar: React.FC<{ outcomes: ClaimOutcomes | undefined }> = ({ outcomes }) => {
  if (!outcomes) return null; // e.g. an older backend that doesn't send the breakdown yet
  const total = outcomes.approved + outcomes.rejected + outcomes.open;
  if (!total) return null;

  return (
    <div>
      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full" role="img"
        aria-label={SEGMENTS.map((s) => `${outcomes[s.key]} ${s.label}`).join(', ')}>
        {SEGMENTS.filter((s) => outcomes[s.key] > 0).map((s) => (
          <div
            key={s.key}
            className={s.bar}
            style={{ width: `${(outcomes[s.key] / total) * 100}%` }}
            title={`${fmtInt(outcomes[s.key])} ${s.label}`}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
        {SEGMENTS.filter((s) => s.key !== 'open' || outcomes.open > 0).map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            <span className="font-semibold tabular-nums text-gray-200">{fmtInt(outcomes[s.key])}</span>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ClaimOutcomeBar;
