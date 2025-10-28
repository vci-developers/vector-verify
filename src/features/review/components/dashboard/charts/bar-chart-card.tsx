'use client';

import { Card, CardContent } from '@/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface BarChartData {
  species: string;
  count: number;
}

interface BarChartCardProps {
  title: string;
  data: BarChartData[];
  description?: string;
}

export function BarChartCard({ title, data, description }: BarChartCardProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="relative">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200">
              <span className="text-xs text-gray-500">i</span>
            </div>
          </div>
          <div className="flex h-80 items-center justify-center text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(item => ({
    species: item.species || 'Unknown',
    count: Number(item.count) || 0,
  }));

  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200">
            <span className="text-xs text-gray-500">i</span>
          </div>
        </div>

        {description && (
          <p className="mb-4 text-sm text-gray-500">{description}</p>
        )}

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData.slice(0, 10)}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="species"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontSize: 12 }}
                width={120}
              />
              <XAxis
                dataKey="count"
                type="number"
                tick={{ fontSize: 12 }}
                tickFormatter={value => value.toString()}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;

                  return (
                    <div className="rounded-md border bg-white px-2 py-1.5 shadow-md">
                      <div className="grid gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        {payload.map((item: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                            <span className="text-sm text-gray-600">
                              Count: {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="count"
                fill="#22c55e"
                radius={[0, 4, 4, 0]}
                name="Count"
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
