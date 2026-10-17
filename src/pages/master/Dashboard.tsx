import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import MasterLayout from '@/components/master/MasterLayout';
import MasterHeader from '@/components/master/MasterHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { DASHBOARD_SOURCE, useDashboardData, useDashboardRange } from '@/hooks/useDashboard';
import type { Comparison, DashboardData } from '@/services/dashboardTypes';
import KpiCard, { type KpiDelta } from '@/components/master/dashboard/KpiCard';
import DateRangeControl from '@/components/master/dashboard/DateRangeControl';
import BrandRanking from '@/components/master/dashboard/BrandRanking';
import BrandMixChart from '@/components/master/dashboard/BrandMixChart';
import BrandReportTable from '@/components/master/dashboard/BrandReportTable';
import { downloadBrandCsv } from '@/components/master/dashboard/brandReport';
import RejectionReasons from '@/components/master/dashboard/RejectionReasons';
import TrendCharts from '@/components/master/dashboard/TrendCharts';
import ClaimOutcomeBar from '@/components/master/dashboard/ClaimOutcomeBar';
import BrandCoverageNotice from '@/components/master/dashboard/BrandCoverageNotice';
import { brandFlags } from '@/components/master/dashboard/brandCoverage';
import { NOT_RECORDED } from '@/services/dashboardTypes';
import { fmtDays, fmtInt, fmtRange, signed } from '@/components/master/dashboard/format';

// ── Layout helpers ────────────────────────────────────────────────────────────

const Panel: React.FC<{
  title: string;
  sub?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ title, sub, action, className, children }) => (
  <Card className={cn('bg-tayaria-darkgray border-tayaria-gray', className)}>
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-white font-semibold text-base">{title}</h2>
          {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </CardContent>
  </Card>
);

const delta = (
  c: Comparison,
  goodWhen: KpiDelta['goodWhen'],
  fmt: (n: number) => string,
): KpiDelta | null =>
  c.current == null || c.previous == null ? null : { value: c.current - c.previous, text: fmt(c.current - c.previous), goodWhen };

// ── Sections ──────────────────────────────────────────────────────────────────

const KpiRow: React.FC<{ data: DashboardData }> = ({ data }) => {
  const { warranties, claims, claimOutcomes, medianDaysToResolution } = data.kpis;
  // "All time" has no comparison period, so there's no "vs prev." line.
  const vs = (text: string) => (data.previousRange ? `vs ${text} prev.` : undefined);
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div className="col-span-2 lg:col-span-1">
        <KpiCard
          label="Warranties registered"
          hint="Warranties registered by customers in the selected period."
          value={fmtInt(warranties.current)}
          delta={delta(warranties, 'up', (n) => signed(n))}
          previousText={vs(fmtInt(warranties.previous))}
        />
      </div>
      <KpiCard
        label="Claims filed"
        hint="Claims submitted by dealers in the selected period. The bar shows where those claims stand now: approved, rejected, or still open (unacknowledged or pending)."
        value={fmtInt(claims.current)}
        delta={delta(claims, 'down', (n) => signed(n))}
        previousText={vs(fmtInt(claims.previous))}
      >
        <ClaimOutcomeBar outcomes={claimOutcomes} />
      </KpiCard>
      <KpiCard
        label="Median days to resolution"
        hint="Median days from a claim being filed to it being approved or rejected, for claims resolved in the period."
        value={fmtDays(medianDaysToResolution.current)}
        delta={delta(medianDaysToResolution, 'down', (n) => `${signed(n, 1)} d`)}
        previousText={vs(fmtDays(medianDaysToResolution.previous))}
      />
    </div>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className={cn('h-[124px] rounded-lg bg-tayaria-darkgray', i === 0 && 'col-span-2 lg:col-span-1')} />
      ))}
    </div>
    <Skeleton className="h-[420px] rounded-lg bg-tayaria-darkgray" />
    <div className="grid lg:grid-cols-5 gap-6">
      <Skeleton className="lg:col-span-2 h-[380px] rounded-lg bg-tayaria-darkgray" />
      <Skeleton className="lg:col-span-3 h-[380px] rounded-lg bg-tayaria-darkgray" />
    </div>
    <Skeleton className="h-[420px] rounded-lg bg-tayaria-darkgray" />
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const { preset, range, previousRange, setPreset, setCustom } = useDashboardRange();
  const { data, error, isLoading, isError, isFetching, refetch } = useDashboardData(range, previousRange);
  const hasData = !!data && data.kpis.warranties.current! + data.kpis.claims.current! > 0;
  const flags = data ? brandFlags(data.brandCoverage, !!data.previousRange) : null;
  const topBrandCount = data?.brandMix.series.filter((s) => s !== 'Other' && s !== NOT_RECORDED).length ?? 0;

  return (
    <MasterLayout>
      <MasterHeader title="Dashboard" />

      {/* contain:inline-size stops the wide brand table from stretching the page on phones – it
          scrolls inside its own card instead. */}
      <main className="p-4 md:p-6 space-y-6 max-w-screen-2xl [contain:inline-size]">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-white font-medium flex items-center gap-2">
              {fmtRange(range)}
              {DASHBOARD_SOURCE === 'mock' && (
                <span
                  className="rounded border border-fuchsia-500/40 bg-fuchsia-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-300"
                  title="VITE_DASHBOARD_SOURCE=mock – figures come from the local mock, not the backend"
                >
                  Mock data
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {previousRange ? `Compared with ${fmtRange(previousRange)}` : 'All data – no comparison period'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isFetching && !isLoading && <RefreshCw className="h-4 w-4 text-gray-500 animate-spin" aria-label="Updating" />}
            <DateRangeControl preset={preset} range={range} onPreset={setPreset} onCustom={setCustom} />
          </div>
        </div>

        {isLoading ? (
          <DashboardSkeleton />
        ) : isError || !data ? (
          <Card className="bg-tayaria-darkgray border-tayaria-gray">
            <CardContent className="p-10 text-center space-y-3">
              <p className="text-white font-medium">Couldn't load the dashboard.</p>
              {error instanceof Error && <p className="text-sm text-gray-500">{error.message}</p>}
              <Button variant="outline" onClick={() => refetch()}>Try again</Button>
            </CardContent>
          </Card>
        ) : (
          <div className={cn('space-y-6 transition-opacity', isFetching && 'opacity-60')}>
            <KpiRow data={data} />

            <Card className="bg-tayaria-darkgray border-tayaria-gray">
              <CardContent className="p-5">
                <TrendCharts range={data.range} />
              </CardContent>
            </Card>

            {!hasData ? (
              <Card className="bg-tayaria-darkgray border-tayaria-gray">
                <CardContent className="p-10 text-center text-gray-400 text-sm">
                  No warranties or claims in this period. Try a wider date range.
                </CardContent>
              </Card>
            ) : (
              <>
                <BrandCoverageNotice
                  coverage={data.brandCoverage}
                  flags={flags!}
                  range={data.range}
                  onViewSinceStart={setCustom}
                />

                <div className="grid lg:grid-cols-5 gap-6">
                  <Panel
                    className="lg:col-span-2"
                    title="Warranties by brand"
                    sub="Count · share · change vs previous period"
                  >
                    <BrandRanking
                      brands={data.brands}
                      notRecorded={data.notRecorded}
                      changeComparable={flags!.changeComparable}
                      changeHint={flags!.changeHint}
                    />
                  </Panel>
                  <Panel
                    className="lg:col-span-3"
                    title="Brand mix over time"
                    sub={`Warranties registered per ${data.brandMix.bucket}, top ${topBrandCount} brands`}
                  >
                    <BrandMixChart mix={data.brandMix} />
                  </Panel>
                </div>

                <Panel
                  title="Brand report"
                  sub="Registrations and claim performance per brand. Click a column to sort."
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-tayaria-gray bg-transparent text-white hover:bg-white/5 hover:text-white shrink-0"
                      onClick={() => downloadBrandCsv(data.brands, data.notRecorded, data.range, flags!)}
                    >
                      <Download className="h-4 w-4 mr-1.5" />
                      Export CSV
                    </Button>
                  }
                >
                  <BrandReportTable rows={data.brands} notRecorded={data.notRecorded} flags={flags!} />
                </Panel>

                <Panel title="Rejection reasons" sub="Claims rejected in this period">
                  <RejectionReasons reasons={data.rejectionReasons} />
                </Panel>
              </>
            )}


          </div>
        )}
      </main>
    </MasterLayout>
  );
};

export default Dashboard;
