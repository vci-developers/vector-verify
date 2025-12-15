'use client';

import { Card, CardContent } from '@/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface RadialChartData {
  name: string;
  value: number;
  percentage: number;
  fill: string;
}

type LegendItem = {
  label: string;
  count: number;
  percentage: number;
  color: string;
};

interface RadialChartCardProps {
  title: string;
  data: RadialChartData[];
  total: number;
  legendItems: LegendItem[];
}

export function RadialChartCard({
  title,
  data,
  total,
  legendItems,
}: RadialChartCardProps) {
  return (
    <Card className="relative py-0">
      <CardContent className="p-0">
        <div className="px-6 pt-6 pb-6">
          <div className="flex items-center justify-center gap-8">
            <div className="max-w-md flex-1">
              <div className="relative h-64 w-full">
                {data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload, coordinate }) => {
                          if (
                            !active ||
                            !payload?.length ||
                            !coordinate ||
                            coordinate.x === undefined ||
                            coordinate.y === undefined
                          )
                            return null;

                          const data = payload[0];
                          const chartCenter = { x: 128, y: 128 };
                          const minDistance = 80;

                          const dx = coordinate.x - chartCenter.x;
                          const dy = coordinate.y - chartCenter.y;
                          const distance = Math.sqrt(dx * dx + dy * dy);

                          let transformX = 0;
                          let transformY = 0;

                          if (distance < minDistance && distance > 0) {
                            const angle = Math.atan2(dy, dx);
                            const pushDistance = minDistance - distance + 30;
                            transformX = Math.cos(angle) * pushDistance;
                            transformY = Math.sin(angle) * pushDistance;
                          }

                          return (
                            <div
                              className="z-10 rounded-md border bg-white px-2 py-1.5 shadow-md"
                              style={{
                                transform: `translate(calc(-50% + ${transformX}px), calc(-50% + ${transformY}px))`,
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                                  style={{ backgroundColor: data.payload.fill }}
                                />
                                <span className="text-sm font-medium">
                                  <span>{data.payload.name}: </span>
                                  <span className="font-bold">
                                    {data.value}
                                  </span>
                                </span>
                              </div>
                            </div>
                          );
                        }}
                        allowEscapeViewBox={{ x: true, y: true }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-500">
                    No data available
                  </div>
                )}
                {data.length > 0 && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-800">
                        Total:
                      </div>
                      <div className="text-3xl font-bold text-gray-800">
                        {total.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="max-w-md flex-1">
              <h3 className="mb-4 text-lg font-bold text-gray-800">{title}</h3>
              <div className="space-y-3">
                {legendItems.map((item, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="text-sm">
                      <span
                        className="font-medium"
                        style={{ color: '#98a3b2' }}
                      >
                        {item.label}:{' '}
                      </span>
                      <span className="font-bold">{item.count}</span>
                      <span style={{ color: '#3c3c3c' }}>
                        {' '}
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
