import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MasterLayout from '@/components/master/MasterLayout';
import MasterHeader from '@/components/master/MasterHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  AlertTriangle, Shield, TrendingUp, Clock, FileText,
  ArrowUpRight, ArrowDownRight, ChevronRight, CheckCircle2,
} from 'lucide-react';

// ── Mock Data ────────────────────────────────────────────────────────────────

const CLAIMS_NEEDING_REVIEW = 12;
const UNACKNOWLEDGED = 5;
const PENDING_APPROVAL = 7;

const MONTHLY_TREND_ALL: { month: string; warranties: number; claims: number }[] = [
  { month: "Jun '25", warranties: 68,  claims: 11 },
  { month: "Jul '25", warranties: 74,  claims: 13 },
  { month: "Aug '25", warranties: 81,  claims: 14 },
  { month: "Sep '25", warranties: 79,  claims: 16 },
  { month: "Oct '25", warranties: 88,  claims: 15 },
  { month: "Nov '25", warranties: 95,  claims: 18 },
  { month: "Dec '25", warranties: 102, claims: 19 },
  { month: "Jan '26", warranties: 91,  claims: 17 },
  { month: "Feb '26", warranties: 84,  claims: 16 },
  { month: "Mar '26", warranties: 96,  claims: 19 },
  { month: "Apr '26", warranties: 103, claims: 21 },
  { month: "May '26", warranties: 89,  claims: 17 },
];

const REJECTION_REASONS = [
  { name: 'Mechanical Failure',    value: 42, color: '#EF4444' },
  { name: 'Over Warranty Period',  value: 28, color: '#F97316' },
  { name: 'No Marking',            value: 19, color: '#FFA500' },
  { name: 'Tread Depth < 6mm',     value: 11, color: '#8B5CF6' },
];

const BRAND_CLAIMS = [
  { brand: 'Pirelli',    approved: 41, rejected: 17 },
  { brand: 'GT Radial',  approved: 26, rejected: 8  },
  { brand: 'Kumho',      approved: 21, rejected: 8  },
  { brand: 'RoadX',      approved: 16, rejected: 6  },
  { brand: 'Doublestar', approved: 10, rejected: 4  },
];

const SHOP_PERFORMANCE = [
  { shop: 'Tayaria PJ',          warranties: 312, claims: 58, approvalRate: 79, avgDays: 3.2 },
  { shop: 'Tayaria KL Sentral',  warranties: 287, claims: 52, approvalRate: 75, avgDays: 4.1 },
  { shop: 'Tayaria Subang',      warranties: 245, claims: 38, approvalRate: 84, avgDays: 2.8 },
  { shop: 'Tayaria Shah Alam',   warranties: 198, claims: 27, approvalRate: 70, avgDays: 5.3 },
  { shop: 'Tayaria Klang',       warranties: 156, claims: 21, approvalRate: 81, avgDays: 3.7 },
];

// ── Shared Chart Style ────────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #333333',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
  },
  labelStyle: { color: '#9CA3AF', marginBottom: 4 },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

// ── KPI Card ─────────────────────────────────────────────────────────────────

interface Trend {
  value: number;   // raw number; sign = direction
  label: string;   // e.g. "+14.1%" or "−0.8 days"
  good: 'up' | 'down';
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  trend?: Trend;
  valueColor?: string;
  highlight?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  icon, label, value, sub, trend, valueColor, highlight,
}) => {
  const isGood = trend
    ? (trend.good === 'up' ? trend.value > 0 : trend.value < 0)
    : undefined;

  return (
    <Card
      className={`border-tayaria-gray transition-colors ${
        highlight
          ? 'bg-amber-500/10 border-amber-500/30'
          : 'bg-tayaria-darkgray hover:bg-[#2a2a2a]'
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-gray-400 text-xs font-medium uppercase tracking-wider leading-tight pr-2">
            {label}
          </span>
          <span className={highlight ? 'text-amber-400' : 'text-gray-500'}>
            {icon}
          </span>
        </div>

        <div className={`text-3xl font-bold mb-2 ${valueColor ?? 'text-white'}`}>
          {value}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {sub && <span className="text-gray-500 text-xs">{sub}</span>}
          {trend && (
            <span
              className={`flex items-center gap-0.5 text-xs font-semibold ${
                isGood ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend.value > 0
                ? <ArrowUpRight className="h-3 w-3" />
                : <ArrowDownRight className="h-3 w-3" />}
              {trend.label}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ── Section Title ─────────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
  <div>
    <h2 className="text-white font-semibold text-base">{title}</h2>
    {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

type Range = '3M' | '6M' | '12M';

const DashboardNew: React.FC = () => {
  const [range, setRange] = useState<Range>('12M');

  const trendData =
    range === '3M' ? MONTHLY_TREND_ALL.slice(-3) :
    range === '6M' ? MONTHLY_TREND_ALL.slice(-6) :
    MONTHLY_TREND_ALL;

  const totalRejections = REJECTION_REASONS.reduce((s, r) => s + r.value, 0);

  return (
    <MasterLayout>
      <MasterHeader title="Analytics Dashboard" />

      <main className="p-4 md:p-6 space-y-8 max-w-screen-2xl">

        {/* ── Alert Banner ─────────────────────────────────────────────── */}
        {CLAIMS_NEEDING_REVIEW > 0 && (
          <div className="flex items-center justify-between gap-4 bg-amber-500/10 border border-amber-500/30 rounded-xl px-5 py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-amber-300 font-semibold text-sm">
                  {CLAIMS_NEEDING_REVIEW} claims awaiting your review
                </p>
                <p className="text-amber-400/60 text-xs mt-0.5">
                  {UNACKNOWLEDGED} unacknowledged · {PENDING_APPROVAL} pending approval
                </p>
              </div>
            </div>
            <Link
              to="/master/claims"
              className="flex items-center gap-1 text-amber-400 text-sm font-semibold hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
            >
              Review Now <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* ── KPI Cards ────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <SectionTitle title="May 2026 Snapshot" sub="Key numbers at a glance" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

            <div className="col-span-2 md:col-span-1">
              <KpiCard
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Needs Review"
                value={CLAIMS_NEEDING_REVIEW}
                sub={`${UNACKNOWLEDGED} unack · ${PENDING_APPROVAL} pending`}
                valueColor="text-amber-400"
                highlight
              />
            </div>

            <KpiCard
              icon={<Shield className="h-4 w-4" />}
              label="Active Warranties"
              value="1,247"
              sub="currently valid"
              valueColor="text-[#FFA500]"
            />

            <KpiCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="New Warranties (May)"
              value="89"
              sub="vs 78 last month"
              trend={{ value: 14.1, label: '+14.1%', good: 'up' }}
            />

            <KpiCard
              icon={<FileText className="h-4 w-4" />}
              label="Claim Rate (May)"
              value="19.1%"
              sub="of active warranties"
              trend={{ value: 2.1, label: '+2.1%', good: 'down' }}
            />

            <KpiCard
              icon={<Clock className="h-4 w-4" />}
              label="Avg Processing"
              value="4.2 days"
              sub="pending → settled"
              trend={{ value: -0.8, label: '−0.8 days', good: 'down' }}
            />
          </div>
        </section>

        {/* ── Monthly Trend Chart ──────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <SectionTitle
              title="Warranties vs Claims — Monthly Trend"
              sub="Compare how many warranties are registered against claims filed each month"
            />
            <div className="flex gap-1 bg-tayaria-black rounded-lg p-1 border border-tayaria-gray">
              {(['3M', '6M', '12M'] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    range === r
                      ? 'bg-[#FFA500] text-black'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <Card className="bg-tayaria-darkgray border-tayaria-gray">
            <CardContent className="pt-6 pb-2">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis
                      dataKey="month"
                      stroke="#555"
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#555"
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Legend
                      formatter={(val) => (
                        <span style={{ color: '#9CA3AF', fontSize: 12 }}>{val}</span>
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="warranties"
                      name="Warranties Registered"
                      stroke="#FFA500"
                      strokeWidth={2.5}
                      dot={{ fill: '#FFA500', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#FFA500' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="claims"
                      name="Claims Filed"
                      stroke="#EF4444"
                      strokeWidth={2.5}
                      dot={{ fill: '#EF4444', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#EF4444' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Two-chart Row ────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Rejection Breakdown Donut */}
          <section className="space-y-3">
            <SectionTitle
              title="Rejection Breakdown"
              sub="Why claims are being turned down (all time)"
            />
            <Card className="bg-tayaria-darkgray border-tayaria-gray h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  {/* Donut */}
                  <div className="h-[210px] flex-1 min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={REJECTION_REASONS}
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={88}
                          dataKey="value"
                          paddingAngle={3}
                          startAngle={90}
                          endAngle={-270}
                        >
                          {REJECTION_REASONS.map((entry, i) => (
                            <Cell key={i} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE.contentStyle}
                          formatter={(val: number) => [
                            `${val} rejections (${Math.round((val / totalRejections) * 100)}%)`,
                            '',
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="space-y-3 shrink-0 pr-2">
                    {REJECTION_REASONS.map((r) => (
                      <div key={r.name} className="flex items-start gap-2.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0"
                          style={{ backgroundColor: r.color }}
                        />
                        <div>
                          <p className="text-white text-xs font-medium leading-tight">{r.name}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {r.value} · {Math.round((r.value / totalRejections) * 100)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total label */}
                <p className="text-center text-gray-500 text-xs mt-1">
                  {totalRejections} total rejections
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Claims by Tyre Brand */}
          <section className="space-y-3">
            <SectionTitle
              title="Claims by Tyre Brand"
              sub="Which brands generate claims — and how many get approved (all time)"
            />
            <Card className="bg-tayaria-darkgray border-tayaria-gray h-full">
              <CardContent className="pt-6">
                <div className="h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={BRAND_CLAIMS}
                      layout="vertical"
                      margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
                      barSize={14}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#2a2a2a"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        stroke="#555"
                        tick={{ fill: '#9CA3AF', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="brand"
                        stroke="#555"
                        tick={{ fill: '#9CA3AF', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={70}
                      />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Legend
                        formatter={(val) => (
                          <span style={{ color: '#9CA3AF', fontSize: 12 }}>{val}</span>
                        )}
                      />
                      <Bar
                        dataKey="approved"
                        name="Approved"
                        stackId="a"
                        fill="#22C55E"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="rejected"
                        name="Rejected"
                        stackId="a"
                        fill="#EF4444"
                        radius={[0, 3, 3, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* ── Shop Performance Table ───────────────────────────────────── */}
        <section className="space-y-3">
          <SectionTitle
            title="Shop Performance"
            sub="How each retail shop is doing — all time. Green = good, amber = watch, red = needs attention."
          />
          <Card className="bg-tayaria-darkgray border-tayaria-gray overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-tayaria-gray">
                    {[
                      ['Shop', 'left', 'pl-6'],
                      ['Warranties', 'right', 'pr-6'],
                      ['Claims', 'right', 'pr-6'],
                      ['Claim Rate', 'right', 'pr-6'],
                      ['Approval Rate', 'right', 'pr-6'],
                      ['Avg Days to Settle', 'right', 'pr-6'],
                    ].map(([h, align, pad]) => (
                      <th
                        key={h}
                        className={`text-${align} text-gray-400 text-xs font-medium uppercase tracking-wider py-4 ${pad}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SHOP_PERFORMANCE.map((row, i) => {
                    const claimRate = Math.round((row.claims / row.warranties) * 100);

                    const approvalColor =
                      row.approvalRate >= 80 ? 'text-green-400' :
                      row.approvalRate >= 70 ? 'text-amber-400' :
                      'text-red-400';

                    const daysColor =
                      row.avgDays <= 3   ? 'text-green-400' :
                      row.avgDays <= 4.5 ? 'text-amber-400' :
                      'text-red-400';

                    const isLast = i === SHOP_PERFORMANCE.length - 1;

                    return (
                      <tr
                        key={row.shop}
                        className={`hover:bg-white/[0.03] transition-colors ${
                          !isLast ? 'border-b border-tayaria-gray/50' : ''
                        }`}
                      >
                        <td className="pl-6 pr-4 py-4 text-white text-sm font-medium">
                          {row.shop}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-200 text-sm">
                          {row.warranties.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-200 text-sm">
                          {row.claims}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-400 text-sm">
                          {claimRate}%
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <span className={`font-semibold ${approvalColor}`}>
                            {row.approvalRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <span className={`font-semibold ${daysColor}`}>
                            {row.avgDays}d
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Color key */}
            <div className="border-t border-tayaria-gray/50 px-6 py-3 flex gap-6 flex-wrap">
              {[
                { color: 'bg-green-400', label: 'Good' },
                { color: 'bg-amber-400', label: 'Watch' },
                { color: 'bg-red-400',   label: 'Needs attention' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-gray-500 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* ── Footer note ──────────────────────────────────────────────── */}
        <p className="text-gray-600 text-xs pb-4">
          All figures are mock data for demonstration purposes. Live data integration coming soon.
        </p>

      </main>
    </MasterLayout>
  );
};

export default DashboardNew;
