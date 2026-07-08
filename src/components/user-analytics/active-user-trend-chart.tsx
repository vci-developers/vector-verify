'use client';

import type { ActiveMetricSnapshot } from '@/api/user/validation/get-user-active-metrics-schema';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { format, parseISO } from 'date-fns';
import { CartesianGrid, Label, Line, LineChart, XAxis, YAxis } from 'recharts';

interface ActiveUserTrendChartProps {
    data: ActiveMetricSnapshot[];
    config: ChartConfig;
    xAxisLabel: string;
    yAxisLabel: string;
}

export default function ActiveUserTrendChart({
    data,
    config,
    xAxisLabel,
    yAxisLabel,
}: ActiveUserTrendChartProps) {
    const seriesKeys = Object.keys(config);

    return (
        <ChartContainer config={config} className="h-72 w-full">
            <LineChart
                data={data}
                margin={{ top: 8, right: 12, bottom: 32, left: 12 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="snapshotDate"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={snapshotDate =>
                        format(parseISO(snapshotDate), 'MMM d')
                    }
                >
                    <Label
                        value={xAxisLabel}
                        position="bottom"
                        className="fill-muted-foreground text-sm font-bold"
                    />
                </XAxis>
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    allowDecimals={false}
                >
                    <Label
                        value={yAxisLabel}
                        angle={-90}
                        position="left"
                        className="fill-muted-foreground text-sm font-bold"
                        style={{ textAnchor: 'middle' }}
                    />
                </YAxis>
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            className="min-w-45"
                            indicator="line"
                            labelFormatter={snapshotDate =>
                                format(parseISO(snapshotDate), 'MMM d, yyyy')
                            }
                        />
                    }
                />
                {seriesKeys.map(seriesKey => (
                    <Line
                        key={seriesKey}
                        type="monotone"
                        dataKey={seriesKey}
                        stroke={config[seriesKey]?.color}
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
            </LineChart>
        </ChartContainer>
    );
}
