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
  const sexRatio = metrics.sexRatio ?? {
    total: 0,
    male: { count: 0, percentage: 0 },
    female: { count: 0, percentage: 0 },
  };
  const abdomenStatus = metrics.abdomenStatus ?? {
    total: 0,
    fed: { count: 0, percentage: 0 },
    unfed: { count: 0, percentage: 0 },
    gravid: { count: 0, percentage: 0 },
  };

  const hasData =
    speciesDistribution.length > 0 ||
    sexRatio.total > 0 ||
    abdomenStatus.total > 0;

  // Figma-aligned palette: shades of green only
  const sexColors = ['#166534', '#22C55E']; // dark green, medium green
  const abdomenColors = ['#166534', '#22C55E', '#86EFAC']; // dark, medium, light green

  const sexRatioChartData = {
    data: [
      {
        name: 'Male',
        value: sexRatio.male.count,
        percentage: sexRatio.male.percentage,
        fill: sexColors[0],
      },
      {
        name: 'Female',
        value: sexRatio.female.count,
        percentage: sexRatio.female.percentage,
        fill: sexColors[1],
      },
    ],
    colors: sexColors,
    legendItems: [
      {
        label: 'Male',
        count: sexRatio.male.count,
        percentage: sexRatio.male.percentage,
        color: sexColors[0],
      },
      {
        label: 'Female',
        count: sexRatio.female.count,
        percentage: sexRatio.female.percentage,
        color: sexColors[1],
      },
    ],
  };

  const abdomenStatusChartData = {
    data: [
      {
        name: 'Fed',
        value: abdomenStatus.fed.count,
        percentage: abdomenStatus.fed.percentage,
        fill: abdomenColors[0],
      },
      {
        name: 'Unfed',
        value: abdomenStatus.unfed.count,
        percentage: abdomenStatus.unfed.percentage,
        fill: abdomenColors[1],
      },
      {
        name: 'Gravid',
        value: abdomenStatus.gravid.count,
        percentage: abdomenStatus.gravid.percentage,
        fill: abdomenColors[2],
      },
    ],
    colors: abdomenColors,
    legendItems: [
      {
        label: 'Fed',
        count: abdomenStatus.fed.count,
        percentage: abdomenStatus.fed.percentage,
        color: abdomenColors[0],
      },
      {
        label: 'Unfed',
        count: abdomenStatus.unfed.count,
        percentage: abdomenStatus.unfed.percentage,
        color: abdomenColors[1],
      },
      {
        label: 'Gravid',
        count: abdomenStatus.gravid.count,
        percentage: abdomenStatus.gravid.percentage,
        color: abdomenColors[2],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Entomological Summary" />

      {!hasData ? (
        <div className="py-8 text-center text-gray-500">
          No specimen data available for this period
        </div>
      ) : (
        <>
          {/* Top row with two radial charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RadialChartCard
              title="Anopheles Sex"
              data={sexRatioChartData.data}
              total={sexRatio.total}
              colors={sexRatioChartData.colors}
              legendItems={sexRatioChartData.legendItems}
            />
            <RadialChartCard
              title="Abdomen Status"
              data={abdomenStatusChartData.data}
              total={abdomenStatus.total}
              colors={abdomenStatusChartData.colors}
              legendItems={abdomenStatusChartData.legendItems}
            />
          </div>

          {/* Bottom row with bar chart and metrics */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Species Distribution */}
            <div className="lg:col-span-2">
              <BarChartCard
                title="Species Distribution"
                data={speciesDistribution}
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
              />
            </div>

            {/* Right side metrics */}
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
