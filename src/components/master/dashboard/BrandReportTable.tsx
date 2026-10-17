import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { BrandRow } from '@/services/dashboardTypes';
import { cn } from '@/lib/utils';
import { fmtInt, fmtPct, signed } from './format';
import { COLUMNS, naReason, notRecordedLabel, sortValue, type SortKey } from './brandReport';
import type { BrandFlags } from './brandCoverage';

interface Props {
  rows: BrandRow[];
  notRecorded: BrandRow | null;
  flags: BrandFlags;
}

const NA: React.FC<{ hint: string }> = ({ hint }) => <span className="text-gray-600 cursor-help" title={hint}>—</span>;

const BrandReportTable: React.FC<Props> = ({ rows, notRecorded, flags }) => {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'warranties', dir: 'desc' });

  const sorted = useMemo(() => {
    const factor = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = sortValue(a, sort.key);
      const bv = sortValue(b, sort.key);
      if (av == null) return 1;   // empty values always last
      if (bv == null) return -1;
      if (typeof av === 'string') return av.localeCompare(bv as string) * factor;
      return ((av as number) - (bv as number)) * factor;
    });
  }, [rows, sort]);

  // Totals cover every warranty/claim, with or without a brand – so overall change and
  // claims per 100 stay valid even when brand data is incomplete.
  const totals = useMemo(() => {
    const all = notRecorded ? [...rows, notRecorded] : rows;
    const sum = (k: 'warranties' | 'previousWarranties' | 'claims' | 'approved' | 'rejected' | 'tyresReplaced') =>
      all.reduce((s, r) => s + r[k], 0);
    const w = sum('warranties');
    const c = sum('claims');
    const a = sum('approved');
    const decided = a + sum('rejected');
    return {
      warranties: w,
      change: w - sum('previousWarranties'),
      claims: c,
      claimsPer100: w ? (c / w) * 100 : null,
      approved: a,
      tyresReplaced: sum('tyresReplaced'),
      approvalRate: decided ? a / decided : null,
    };
  }, [rows, notRecorded]);

  const cell = (c: (typeof COLUMNS)[number], r: BrandRow) => {
    const reason = naReason(c.key, r, flags);
    return reason ? <NA hint={reason} /> : c.render(r);
  };

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'brand' ? 'asc' : 'desc' }));

  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full min-w-[760px] text-sm tabular-nums">
        <thead>
          <tr className="border-b border-tayaria-gray">
            {COLUMNS.map((c) => {
              const active = sort.key === c.key;
              const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className={cn('py-2.5 px-2 font-medium text-xs text-gray-400 whitespace-nowrap', c.align === 'left' ? 'text-left' : 'text-right')}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key)}
                    title={c.hint}
                    className={cn('inline-flex items-center gap-1 hover:text-white transition-colors', active && 'text-white')}
                  >
                    {c.label}
                    <Icon className={cn('h-3 w-3', !active && 'opacity-40')} />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.brand} className="border-b border-tayaria-gray/60 hover:bg-white/[0.02]">
              {COLUMNS.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    'py-2.5 px-2 whitespace-nowrap',
                    c.align === 'left' ? 'text-left text-white font-medium' : 'text-right text-gray-200',
                  )}
                >
                  {cell(c, r)}
                </td>
              ))}
            </tr>
          ))}
          {/* Pinned below the brands regardless of sort – it isn't a brand. */}
          {notRecorded && (
            <tr className="border-b border-tayaria-gray/60 text-gray-400">
              {COLUMNS.map((c) => (
                <td
                  key={c.key}
                  className={cn('py-2.5 px-2 whitespace-nowrap', c.align === 'left' ? 'text-left italic' : 'text-right')}
                >
                  {c.key === 'brand' ? notRecordedLabel : cell(c, notRecorded)}
                </td>
              ))}
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="text-white font-semibold">
            <td className="py-2.5 px-2 text-left">Total</td>
            <td className="py-2.5 px-2 text-right">{fmtInt(totals.warranties)}</td>
            <td className="py-2.5 px-2 text-right">{notRecorded ? <NA hint="Shares only cover warranties with a brand" /> : '100%'}</td>
            <td className="py-2.5 px-2 text-right">
              {flags.hasComparison ? signed(totals.change) : <NA hint={flags.changeHint} />}
            </td>
            <td className="py-2.5 px-2 text-right">{fmtInt(totals.claims)}</td>
            <td className="py-2.5 px-2 text-right">{totals.claimsPer100 == null ? '—' : totals.claimsPer100.toFixed(1)}</td>
            <td className="py-2.5 px-2 text-right">{fmtInt(totals.approved)}</td>
            <td className="py-2.5 px-2 text-right">{fmtInt(totals.tyresReplaced)}</td>
            <td className="py-2.5 px-2 text-right">{fmtPct(totals.approvalRate)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default BrandReportTable;
