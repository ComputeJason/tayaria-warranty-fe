import React from 'react';
import { format } from 'date-fns';
import { NOT_RECORDED, type BrandRow, type DateRange } from '@/services/dashboardTypes';
import { fmtInt, fmtPct, signed } from './format';
import { RATE_NA_HINT, type BrandFlags } from './brandCoverage';

// Column definitions for the brand report – shared by the on-screen table and the CSV export.

export type SortKey = keyof Pick<
  BrandRow,
  'brand' | 'warranties' | 'share' | 'claims' | 'claimsPer100' | 'approved' | 'tyresReplaced' | 'approvalRate'
> | 'change';

interface Column {
  key: SortKey;
  label: string;
  hint?: string;
  align?: 'left' | 'right';
  render: (r: BrandRow) => React.ReactNode;
  csv: (r: BrandRow) => string | number;
}

export const change = (r: BrandRow) => r.warranties - r.previousWarranties;

export const COLUMNS: Column[] = [
  { key: 'brand', label: 'Brand', align: 'left', render: (r) => r.brand, csv: (r) => r.brand },
  { key: 'warranties', label: 'Warranties', render: (r) => fmtInt(r.warranties), csv: (r) => r.warranties },
  { key: 'share', label: 'Share', render: (r) => fmtPct(r.share, 1), csv: (r) => (r.share * 100).toFixed(1) },
  {
    key: 'change',
    label: 'Change',
    hint: 'Warranties vs. previous period',
    render: (r) => {
      const c = change(r);
      return <span className={c > 0 ? 'text-green-400' : c < 0 ? 'text-red-400' : 'text-gray-500'}>{signed(c)}</span>;
    },
    csv: (r) => change(r),
  },
  { key: 'claims', label: 'Claims', render: (r) => fmtInt(r.claims), csv: (r) => r.claims },
  {
    key: 'claimsPer100',
    label: 'Claims / 100',
    hint: 'Claims filed per 100 warranties registered in the same period',
    render: (r) => (r.claimsPer100 == null ? '—' : r.claimsPer100.toFixed(1)),
    csv: (r) => (r.claimsPer100 == null ? '' : r.claimsPer100.toFixed(1)),
  },
  { key: 'approved', label: 'Approved', render: (r) => fmtInt(r.approved), csv: (r) => r.approved },
  {
    key: 'tyresReplaced',
    label: 'Tyres replaced',
    hint: 'Total tyres on approved claims',
    render: (r) => fmtInt(r.tyresReplaced),
    csv: (r) => r.tyresReplaced,
  },
  {
    key: 'approvalRate',
    label: 'Approval rate',
    hint: 'Approved ÷ decided claims',
    render: (r) => fmtPct(r.approvalRate),
    csv: (r) => (r.approvalRate == null ? '' : (r.approvalRate * 100).toFixed(1)),
  },
];

/**
 * Why a cell should show "—" instead of its number, or null if the number is fine to show.
 * The "not recorded" row has no meaningful share/change/rate, and brand comparisons are hidden
 * when too many warranties lack a brand (see brandCoverage.ts).
 */
export const naReason = (key: SortKey, r: BrandRow, flags: BrandFlags): string | null => {
  if (r.brand === NOT_RECORDED && (key === 'share' || key === 'change' || key === 'claimsPer100')) {
    return 'Not applicable to warranties without a brand';
  }
  if (key === 'change' && !flags.changeComparable) return flags.changeHint;
  if (key === 'claimsPer100' && !flags.ratesReliable) return RATE_NA_HINT;
  return null;
};

export const notRecordedLabel = 'Brand not recorded';

export const sortValue = (r: BrandRow, key: SortKey) => (key === 'change' ? change(r) : r[key]);

const csvCell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const downloadBrandCsv = (
  rows: BrandRow[],
  notRecorded: BrandRow | null,
  range: DateRange,
  flags: BrandFlags,
) => {
  const header = COLUMNS.map((c) => (c.key === 'share' || c.key === 'approvalRate' ? `${c.label} (%)` : c.label));
  const toCsv = (r: BrandRow) =>
    COLUMNS.map((c) =>
      c.key === 'brand' && r.brand === NOT_RECORDED ? notRecordedLabel : naReason(c.key, r, flags) ? '' : c.csv(r),
    );
  const body = [...rows, ...(notRecorded ? [notRecorded] : [])].map(toCsv);
  const lines = [header, ...body].map((row) => row.map(csvCell).join(','));
  // BOM so Excel opens it as UTF-8.
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tayaria-brand-report_${format(range.from, 'yyyy-MM-dd')}_to_${format(range.to, 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

