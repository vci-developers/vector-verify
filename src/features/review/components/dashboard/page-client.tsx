'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/ui/card';
import { useDashboardDataQuery } from '@/features/review/hooks';
import { getMonthDateRange } from '@/features/review/utils/master-table-view';
import { SiteInformationSection } from './site-information-section';
import { EntomologicalSummarySection } from './entomological-summary-section';
import { BednetsDataSection } from './bednets-data-section';
import { DashboardLoadingSkeleton } from './loading-skeleton';

interface DashboardPageClientProps {
  district: string;
  monthYear: string;
}

export function DashboardPageClient({
  district,
  monthYear,
}: DashboardPageClientProps) {
  const dateRange = getMonthDateRange(monthYear);
  const startDate = dateRange?.startDate;
  const endDate = dateRange?.endDate;

  const [year, monthNum] = monthYear.split('-').map(Number);

  const { data, isLoading, error } = useDashboardDataQuery({
    district,
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  });

  const monthName = useMemo(() => {
    return new Date(year, monthNum - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [year, monthNum]);

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="mb-2 text-lg font-semibold text-red-600">
                Error Loading Dashboard
              </h2>
              <p className="text-gray-600">
                {error?.message || 'An unexpected error occurred'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="mb-2 text-lg font-semibold text-gray-600">
                No Data Available
              </h2>
              <p className="text-gray-500">
                No data found for {district} in {monthName}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">{district}</h1>
          <p className="mt-2 text-lg text-gray-600">{monthName}</p>
        </div>

        <div className="space-y-12">
          <SiteInformationSection
            data={data.siteInformation}
            vectorDensity={data.entomologicalSummary.vectorDensity}
          />

          <EntomologicalSummarySection metrics={data} />

          <BednetsDataSection data={data.entomologicalSummary} />
        </div>
      </div>
    </div>
  );
}
