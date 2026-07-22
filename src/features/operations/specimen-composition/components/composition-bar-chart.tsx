'use client';

import {
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Label, XAxis, YAxis } from 'recharts';

interface CompositionBarChartProps {
    specimenClasses: string[];
    specimenCountsByMonth: Record<string, string | number>[];
    specimenChartConfig: ChartConfig;
}

export default function CompositionBarChart({
    specimenClasses,
    specimenCountsByMonth,
    specimenChartConfig,
}: CompositionBarChartProps) {
    return (
        <BarChart
            data={specimenCountsByMonth}
            margin={{
                top: 8,
                right: 12,
                bottom: 32,
                left: 12,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false}>
                <Label
                    value="Month"
                    position="bottom"
                    className="fill-muted-foreground text-sm font-bold"
                />
            </XAxis>
            <YAxis tickLine={false} axisLine={false} width={44}>
                <Label
                    value="Specimen Count"
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
                    />
                }
            />
            {specimenClasses.map(specimenClass => (
                <Bar
                    key={specimenClass}
                    dataKey={specimenClass}
                    stackId="specimens"
                    fill={specimenChartConfig[specimenClass]?.color}
                    stroke={specimenChartConfig[specimenClass]?.color}
                    fillOpacity={0.75}
                    strokeWidth={2}
                />
            ))}
            <ChartLegend
                wrapperStyle={{ paddingTop: '1rem' }}
                content={
                    <ChartLegendContent className="text-muted-foreground flex-wrap" />
                }
            />
        </BarChart>
    );
}
