'use client';

import { Bug, Moon } from 'lucide-react';
import { SectionHeader, InfoCard } from './shared';
import { RadialChartCard, BarChartCard } from './charts';
import {
  processSexRatioData,
  processAbdomenStatusData,
  hasChartData,
} from './utils/data-processor';
import type {
  DashboardMetrics,
  SpeciesDistribution,
  SexRatio,
  AbdomenStatus,
} from '@/features/review/types/model';

interface EntomologicalSummarySectionProps {
  data: DashboardMetrics['entomologicalSummary'];
  speciesDistribution: SpeciesDistribution[];
  sexRatio: SexRatio;
  abdomenStatus: AbdomenStatus;
}

export function EntomologicalSummarySection({
  data,
  speciesDistribution,
  sexRatio,
  abdomenStatus,
}: EntomologicalSummarySectionProps) {
  // Process data for charts
  const hasData = hasChartData(sexRatio, abdomenStatus, speciesDistribution);
  const sexRatioChartData = processSexRatioData(sexRatio);
  const abdomenStatusChartData = processAbdomenStatusData(abdomenStatus);

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
