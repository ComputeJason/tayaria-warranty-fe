import React from 'react';
import type { DashboardData } from '@/services/dashboardTypes';
import { fmtInt, fmtPct } from './format';

const RejectionReasons: React.FC<{ reasons: DashboardData['rejectionReasons'] }> = ({ reasons }) => {
  const total = reasons.reduce((s, r) => s + r.count, 0);

  if (!total) {
    return <p className="text-sm text-gray-500 py-8 text-center">No rejected claims in this period.</p>;
  }

  return (
    <ul className="space-y-4">
      {reasons.map((r) => (
        <li key={r.reason}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-gray-200">{r.reason}</span>
            <span className="tabular-nums text-white font-semibold whitespace-nowrap">
              {fmtInt(r.count)} <span className="text-gray-500 font-normal text-xs">{fmtPct(r.count / total)}</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded bg-white/[0.04] overflow-hidden">
            <div className="h-full rounded bg-red-400/70" style={{ width: `${(r.count / total) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RejectionReasons;
