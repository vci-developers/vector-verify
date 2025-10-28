'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/ui/skeleton';

// Dynamically import Recharts components to avoid SSR issues
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full" />,
});
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), {
  ssr: false,
});
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), {
  ssr: false,
});
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), {
  ssr: false,
});
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import('recharts').then(mod => mod.CartesianGrid),
  { ssr: false },
);
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  {
    ssr: false,
    loading: () => <Skeleton className="h-48 w-full" />,
  },
);
import type {
  DashboardMetrics,
  SpeciesDistribution,
  SexRatio,
  AbdomenStatus,
} from '@/features/review/types/dashboard';

interface EntomologicalSummarySectionProps {
  data: DashboardMetrics['entomologicalSummary'];
  speciesDistribution: SpeciesDistribution[];
  sexRatio: SexRatio;
  abdomenStatus: AbdomenStatus;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function EntomologicalSummarySection({
  data,
  speciesDistribution,
  sexRatio,
  abdomenStatus,
}: EntomologicalSummarySectionProps) {
  // Prepare data for charts
  const sexRatioData = [
    {
      name: 'Male',
      value: sexRatio.male.count,
      percentage: sexRatio.male.percentage,
    },
    {
      name: 'Female',
      value: sexRatio.female.count,
      percentage: sexRatio.female.percentage,
    },
  ];

  // Check if we have data to render charts
  const hasData =
    sexRatio.total > 0 ||
    abdomenStatus.total > 0 ||
    speciesDistribution.length > 0;

  const abdomenStatusData = [
    {
      name: 'Fed',
      value: abdomenStatus.fed.count,
      percentage: abdomenStatus.fed.percentage,
    },
    {
      name: 'Unfed',
      value: abdomenStatus.unfed.count,
      percentage: abdomenStatus.unfed.percentage,
    },
    {
      name: 'Gravid',
      value: abdomenStatus.gravid.count,
      percentage: abdomenStatus.gravid.percentage,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Entomological Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasData ? (
          <div className="py-8 text-center text-gray-500">
            No specimen data available for this period
          </div>
        ) : (
          <>
            {/* Anopheles Sex Ratio */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-600">
                Anopheles Sex Ratio
              </h3>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-blue-600">
                  {sexRatio.total.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total specimens</div>
              </div>

              <div className="h-48 min-h-[192px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={192}
                >
                  <PieChart width={400} height={192}>
                    <Pie
                      data={sexRatioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sexRatioData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${value} (${sexRatioData.find(d => d.name === name)?.percentage}%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center space-x-6 text-sm">
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                  Male: {sexRatio.male.count} ({sexRatio.male.percentage}%)
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                  Female: {sexRatio.female.count} ({sexRatio.female.percentage}
                  %)
                </div>
              </div>
            </div>

            {/* Abdomen Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-600">
                Abdomen Status
              </h3>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">
                  {abdomenStatus.total.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total specimens</div>
              </div>

              <div className="h-48 min-h-[192px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={192}
                >
                  <PieChart width={400} height={192}>
                    <Pie
                      data={abdomenStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {abdomenStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index + (2 % COLORS.length)]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${value} (${abdomenStatusData.find(d => d.name === name)?.percentage}%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
                  Fed: {abdomenStatus.fed.count} ({abdomenStatus.fed.percentage}
                  %)
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full bg-orange-500"></div>
                  Unfed: {abdomenStatus.unfed.count} (
                  {abdomenStatus.unfed.percentage}%)
                </div>
                <div className="flex items-center">
                  <div className="mr-2 h-3 w-3 rounded-full bg-purple-500"></div>
                  Gravid: {abdomenStatus.gravid.count} (
                  {abdomenStatus.gravid.percentage}%)
                </div>
              </div>
            </div>

            {/* Species Distribution */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-600">
                Species Distribution
              </h3>
              <div className="h-64 min-h-[256px] w-full">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={256}
                >
                  <BarChart
                    width={600}
                    height={256}
                    data={speciesDistribution.slice(0, 10)}
                    layout="horizontal"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="species" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">
                  Number of LLINs
                </h3>
                <div className="text-2xl font-bold text-indigo-600">
                  {data.totalLlins.toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">
                  Fed mosquitoes to People slept ratio
                </h3>
                <div className="text-2xl font-bold text-red-600">
                  {data.fedMosquitoesToPeopleSleptRatio.toFixed(2)}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
