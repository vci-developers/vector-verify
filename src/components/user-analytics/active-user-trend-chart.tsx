'use client';

import type { ActiveMetricSnapshot } from '@/api/user/validation/active-metric-snapshot-schema';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { format, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';
import { CartesianGrid, Label, Line, LineChart, XAxis, YAxis } from 'recharts';

interface ActiveUserTrendChartProps {
    metrics: ActiveMetricSnapshot[];
}

export default function ActiveUserTrendChart({
    metrics,
}: ActiveUserTrendChartProps) {
    const t = useTranslations('UserAnalytics');

    const config: ChartConfig = {
        a1Count: { label: t('a1Label'), color: 'var(--chart-1)' },
        a7Count: { label: t('a7Label'), color: 'var(--chart-2)' },
        a30Count: { label: t('a30Label'), color: 'var(--chart-3)' },
    };
    const metricsBySnapshotDate = [...metrics].sort(
        (firstSnapshot, secondSnapshot) =>
            firstSnapshot.snapshotDate.localeCompare(
                secondSnapshot.snapshotDate,
            ),
    );
    const seriesKeys = Object.keys(config);

    return (
        <ChartContainer config={config} className="h-72 w-full">
            <LineChart
                data={metricsBySnapshotDate}
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
                        value={t('axisDateLabel')}
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
                        value={t('axisActiveUsersLabel')}
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
