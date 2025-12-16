'use client';

import Image from 'next/image';
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

  const sexColors = ['#6ccb81', '#a9e4ba'];
  const abdomenColors = ['#4faf8c', '#6ccb81', '#a9e4ba'];

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
      <SectionHeader title="Entomological Summary" showBreakline={false} />

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
                tooltipContent="This chart displays the distribution of different mosquito species collected during the survey. Understanding species composition is important because different species have varying roles in disease transmission. Anopheles species are primary malaria vectors, while other species may have different ecological roles."
              />
            </div>

            <div className="space-y-6">
              <InfoCard
                icon={<Image src="/assets/auth/icons/Mosquito.png" alt="Mosquito" width={24} height={24} className="object-contain" />}
                title="No. of LLINs"
                value={data.totalLlins}
                tooltipContent="LLINs (Long-Lasting Insecticidal Nets) are bednets treated with insecticides that remain effective for multiple years. This count represents the total number of LLINs reported in the surveyed houses. LLINs are a key intervention tool for preventing mosquito bites and reducing malaria transmission."
              />
              <InfoCard
                icon={<Image src="/assets/auth/icons/Moon.png" alt="Moon" width={20} height={20} className="object-contain" />}
                title="Fed Mosquitoes to People who Slept Ratio"
                value={data.fedMosquitoesToPeopleSleptRatio.toFixed(1)}
                tooltipContent="Fed mosquitoes to people who slept ratio is averaged across all houses. This ratio compares the number of blood-fed mosquitoes collected to the number of people who slept in the surveyed houses. A higher ratio may indicate increased biting activity and potential transmission risk. This metric helps assess the effectiveness of protective measures like bednets."
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
