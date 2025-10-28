'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { useDashboardDataQuery } from '@/features/review/hooks';
import { BackButton } from '@/features/dashboard/components/back-button';
import { SiteInformationSection } from './site-information-section';
import { EntomologicalSummarySection } from './entomological-summary-section';
import { BednetsDataSection } from './bednets-data-section';
import { DashboardLoadingSkeleton } from './dashboard-loading-skeleton';

interface DashboardPageClientProps {
  district: string;
  monthYear: string;
}

export function DashboardPageClient({
  district,
  monthYear,
}: DashboardPageClientProps) {
  const [year, monthNum] = monthYear.split('-').map(Number);
  const startOfMonth = new Date(year, monthNum - 1, 1);
  const endOfMonth = new Date(year, monthNum, 0);

  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];

  const { data, isLoading, error } = useDashboardDataQuery({
    district,
    startDate,
    endDate,
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
                {error instanceof Error
                  ? error.message
                  : 'An unexpected error occurred'}
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
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <BackButton />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Review Data Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          {district} - {monthName}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Site Information */}
        <SiteInformationSection data={data.siteInformation} />

        {/* Entomological Summary */}
        <EntomologicalSummarySection
          data={data.entomologicalSummary}
          speciesDistribution={data.speciesDistribution}
          sexRatio={data.sexRatio}
          abdomenStatus={data.abdomenStatus}
        />

        {/* Bednets Data */}
        <BednetsDataSection data={data.entomologicalSummary} />
      </div>
    </div>
  );
}
