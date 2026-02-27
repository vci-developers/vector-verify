'use client';

import { Card, CardContent } from '@/ui/card';
import Image from 'next/image';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface BarChartData {
  species: string;
  count: number;
}

interface BarChartCardProps {
  title: string;
  data: BarChartData[];
  tooltipContent?: string;
}

function InfoIconTooltip({
  showTooltip,
  onMouseEnter,
  onMouseLeave,
  tooltipContent,
  title,
  topOffset = 'top-12',
}: {
  showTooltip: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  tooltipContent?: string;
  title: string;
  topOffset?: string;
}) {
  return (
    <div
      className={`absolute ${topOffset} right-6 cursor-pointer`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Image
        src="/assets/auth/icons/Info.svg"
        alt="Info"
        width={20}
        height={20}
        className="object-contain"
        style={{
          filter:
            'brightness(0) saturate(100%) invert(38%) sepia(7%) saturate(940%) hue-rotate(201deg) brightness(95%) contrast(89%)',
        }}
      />
      {showTooltip && (
        <div className="absolute top-8 right-0 z-50 w-64 rounded-md border bg-white px-3 py-2 shadow-lg">
          <p className="text-sm text-gray-700">{tooltipContent || title}</p>
        </div>
      )}
    </div>
  );
}

export function BarChartCard({
  title,
  data,
  tooltipContent,
}: BarChartCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!data || data.length === 0) {
    return (
      <Card className="relative py-0">
        <CardContent className="p-0">
          <div className="px-12 pt-12 pb-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <InfoIconTooltip
                showTooltip={showTooltip}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                tooltipContent={tooltipContent}
                title={title}
              />
            </div>
            <div className="flex h-64 items-center justify-center text-gray-500">
              No data available
            </div>
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
    <Card className="relative py-0">
      <CardContent className="p-0">
        <div className="px-12 pt-12 pb-0">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <InfoIconTooltip
              showTooltip={showTooltip}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              tooltipContent={tooltipContent}
              title={title}
            />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.slice(0, 10)}
                layout="vertical"
                margin={{ top: 20, right: 80, left: 40, bottom: 30 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="species"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tick={{ fontSize: 14, fill: '#0f0f0f' }}
                  width={160}
                />
                <XAxis
                  dataKey="count"
                  type="number"
                  tick={{ fontSize: 12 }}
                  tickFormatter={value => value.toString()}
                  label={{
                    value: 'Counts',
                    position: 'insideBottom',
                    offset: -5,
                    style: { fontSize: 12 },
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#a9e4ba"
                  radius={[0, 4, 4, 0]}
                  name="Count"
                  maxBarSize={40}
                  label={{
                    position: 'right',
                    formatter: (value: number) => value,
                    style: {
                      fontWeight: 'bold',
                      fill: '#000',
                      fontSize: '12px',
                    },
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
