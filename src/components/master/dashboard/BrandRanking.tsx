import React from 'react';
import type { BrandRow } from '@/services/dashboardTypes';
import { cn } from '@/lib/utils';
import { fmtInt, fmtPct, signed } from './format';

interface Props {
  brands: BrandRow[];
  notRecorded: BrandRow | null;
  changeComparable: boolean;
  changeHint: string;
}

/** Horizontal bar ranking of warranties registered per brand. */
const BrandRanking: React.FC<Props> = ({ brands, notRecorded, changeComparable, changeHint }) => {
  const max = Math.max(1, ...brands.map((b) => b.warranties));

  if (!brands.some((b) => b.warranties > 0)) {
    return <p className="text-sm text-gray-500 py-8 text-center">No warranties with a brand in this period.</p>;
  }

  return (
    <div>
      <ol className="space-y-3">
        {brands.map((b, i) => {
          const change = b.warranties - b.previousWarranties;
          return (
            // Phones: bar on its own row under the name. sm+: name | bar | numbers on one row.
            <li
              key={b.brand}
              className="grid grid-cols-[1.5rem_1fr_auto] sm:grid-cols-[1.5rem_8rem_1fr_auto] items-center gap-x-3 gap-y-1.5"
            >
              <span className="col-start-1 row-start-1 text-xs text-gray-500 tabular-nums">{i + 1}</span>
              <span className="col-start-2 row-start-1 text-sm text-white truncate" title={b.brand}>{b.brand}</span>
              <div className="col-start-2 col-span-2 row-start-2 sm:col-start-3 sm:col-span-1 sm:row-start-1 h-2 sm:h-6 rounded bg-white/[0.04] overflow-hidden">
                <div
                  className={cn('h-full rounded transition-[width] duration-500', i === 0 ? 'bg-tayaria-yellow' : 'bg-tayaria-yellow/60')}
                  style={{ width: `${(b.warranties / max) * 100}%` }}
                />
              </div>
              <div className="col-start-3 row-start-1 sm:col-start-4 flex items-baseline gap-2 justify-end tabular-nums text-sm min-w-[7.5rem]">
                <span className="font-semibold text-white">{fmtInt(b.warranties)}</span>
                <span className="text-gray-500 text-xs w-9 text-right">{fmtPct(b.share)}</span>
                {changeComparable ? (
                  <span
                    className={cn(
                      'text-xs w-10 text-right',
                      change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-500',
                    )}
                    title={`${fmtInt(b.previousWarranties)} in previous period`}
                  >
                    {signed(change)}
                  </span>
                ) : (
                  <span className="text-xs w-10 text-right text-gray-600" title={changeHint}>—</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Warranties without a brand: shown for completeness, but not ranked and not part of the shares. */}
      {notRecorded && notRecorded.warranties > 0 && (
        <div className="mt-4 pt-3 border-t border-tayaria-gray flex items-baseline justify-between gap-3 text-sm">
          <span className="text-gray-500 italic">Brand not recorded</span>
          <span className="tabular-nums text-gray-400">
            {fmtInt(notRecorded.warranties)} <span className="text-xs text-gray-600">not included in shares</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandRanking;
