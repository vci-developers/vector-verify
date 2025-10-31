'use client';

import { Bug, Moon } from 'lucide-react';
import { SectionHeader, InfoCard } from './shared';
import { RadialChartCard, BarChartCard } from './charts';
import type { DashboardMetrics } from '@/features/review/types/model';

interface EntomologicalSummarySectionProps {
  metrics: DashboardMetrics;
}

export function EntomologicalSummarySection({
  metrics,
}: EntomologicalSummarySectionProps) {
  const data = metrics.entomologicalSummary;
  const speciesDistribution = metrics.speciesDistribution ?? [];
  const sexDistribution = metrics.sexDistribution ?? {
    total: 0,
    male: { count: 0, percentage: 0 },
    female: { count: 0, percentage: 0 },
  };
  const abdomenStatusDistribution = metrics.abdomenStatusDistribution ?? {
    total: 0,
    fed: { count: 0, percentage: 0 },
    unfed: { count: 0, percentage: 0 },
    gravid: { count: 0, percentage: 0 },
  };

  const hasData =
    speciesDistribution.length > 0 ||
    sexDistribution.total > 0 ||
    abdomenStatusDistribution.total > 0;

  const sexColors = [
    'var(--color-chart-green-dark)',
    'var(--color-chart-green-medium)',
  ];
  const abdomenColors = [
    'var(--color-chart-green-dark)',
    'var(--color-chart-green-medium)',
    'var(--color-chart-green-light)',
  ];

  const sexDistributionChartData = [
    {
      name: 'Male',
      value: sexDistribution.male.count,
      percentage: sexDistribution.male.percentage,
      fill: sexColors[0],
    },
    {
      name: 'Female',
      value: sexDistribution.female.count,
      percentage: sexDistribution.female.percentage,
      fill: sexColors[1],
    },
  ];

  const sexDistributionLegendItems = [
    {
      label: 'Male',
      count: sexDistribution.male.count,
      percentage: sexDistribution.male.percentage,
      color: sexColors[0],
    },
    {
      label: 'Female',
      count: sexDistribution.female.count,
      percentage: sexDistribution.female.percentage,
      color: sexColors[1],
    },
  ];

  const abdomenStatusChartData = [
    {
      name: 'Fed',
      value: abdomenStatusDistribution.fed.count,
      percentage: abdomenStatusDistribution.fed.percentage,
      fill: abdomenColors[0],
    },
    {
      name: 'Unfed',
      value: abdomenStatusDistribution.unfed.count,
      percentage: abdomenStatusDistribution.unfed.percentage,
      fill: abdomenColors[1],
    },
    {
      name: 'Gravid',
      value: abdomenStatusDistribution.gravid.count,
      percentage: abdomenStatusDistribution.gravid.percentage,
      fill: abdomenColors[2],
    },
  ];

  const abdomenStatusLegendItems = [
    {
      label: 'Fed',
      count: abdomenStatusDistribution.fed.count,
      percentage: abdomenStatusDistribution.fed.percentage,
      color: abdomenColors[0],
    },
    {
      label: 'Unfed',
      count: abdomenStatusDistribution.unfed.count,
      percentage: abdomenStatusDistribution.unfed.percentage,
      color: abdomenColors[1],
    },
    {
      label: 'Gravid',
      count: abdomenStatusDistribution.gravid.count,
      percentage: abdomenStatusDistribution.gravid.percentage,
      color: abdomenColors[2],
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Entomological Summary" />

      {!hasData ? (
        <div className="py-8 text-center text-gray-500">
          No specimen data available for this period
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RadialChartCard
              title="Anopheles Sex"
              data={sexDistributionChartData}
              total={sexDistribution.total}
              legendItems={sexDistributionLegendItems}
            />
            <RadialChartCard
              title="Abdomen Status"
              data={abdomenStatusChartData}
              total={abdomenStatusDistribution.total}
              legendItems={abdomenStatusLegendItems}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <BarChartCard
                title="Species Distribution"
                data={speciesDistribution}
              />
            </div>

            <div className="space-y-6">
              <InfoCard
                icon={<Bug className="h-8 w-8" />}
                title="No. of LLINs"
                value={data.totalLlins}
              />
              <InfoCard
                icon={<Moon className="h-8 w-8" />}
                title="Fed Mosquitoes to People who Slept Ratio"
                value={data.fedMosquitoesToPeopleSleptRatio.toFixed(1)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
