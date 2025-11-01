'use client';

import { useDataQualitySummary } from '@/features/review/hooks/use-data-quality';
import { getMonthDateRange } from '@/features/review/utils/master-table-view';

import { DataQualityLoading } from './loading';
import { MissingSitesCard } from './missing-sites-card';
import { SiteDiscrepanciesCard } from './site-discrepancies-card';

export function ReviewDataQualityPageClient({
  district,
  monthYear,
}: {
  district: string;
  monthYear: string;
}) {
  const decodedDistrict = decodeURIComponent(district);
  const decodedMonthYear = decodeURIComponent(monthYear);
  const dateRange = getMonthDateRange(decodedMonthYear);

  const { siteDiscrepancies, missingSites, isLoading } =
    useDataQualitySummary({ district, monthYear });

  if (isLoading) {
    return <DataQualityLoading />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-1 border-b pb-4">
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          DHIS2 Review – Data Quality
        </p>
        <h1 className="text-3xl font-semibold">{decodedDistrict}</h1>
        <p className="text-muted-foreground text-sm">
          {dateRange
            ? `${dateRange.startDate} – ${dateRange.endDate}`
            : 'Date range unavailable'}
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SiteDiscrepanciesCard siteDiscrepancies={siteDiscrepancies} />
        <MissingSitesCard sites={missingSites} />
      </section>
    </div>
  );
}
