'use client';

import { Card, CardContent } from '@/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface RadialChartData {
  name: string;
  value: number;
  percentage: number;
  fill: string;
}

interface RadialChartCardProps {
  title: string;
  data: RadialChartData[];
  total: number;
  colors: string[];
  legendItems: Array<{
    label: string;
    count: number;
    percentage: number;
    color: string;
  }>;
}

const chartConfig = {
  value: {
    label: 'Value',
  },
  name: {
    label: 'Name',
  },
};

export function RadialChartCard({
  title,
  data,
  total,
  colors,
  legendItems,
}: RadialChartCardProps) {
  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200">
            <span className="text-xs text-gray-500">i</span>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center">
          <div className="text-3xl font-bold text-gray-800">
            Total: {total.toLocaleString()}
          </div>
        </div>

        <div className="h-64 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;

                    const data = payload[0];
                    return (
                      <div className="rounded-md border bg-white px-2 py-1.5 shadow-md">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: data.payload.fill }}
                          />
                          <span className="text-sm font-medium">
                            {data.name}: {data.value} ({data.payload.percentage}
                            %)
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center space-x-4 text-sm">
          {legendItems.map((item: any, index: number) => (
            <div key={index} className="flex items-center">
              <div
                className="mr-2 h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}: {item.count} ({item.percentage}%)
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
