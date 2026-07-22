'use client';

import {
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, Label, XAxis, YAxis } from 'recharts';

interface CompositionLineChartProps {
    specimenClasses: string[];
    specimenCountsByMonth: Record<string, string | number>[];
    specimenChartConfig: ChartConfig;
}

export default function CompositionLineChart({
    specimenClasses,
    specimenCountsByMonth,
    specimenChartConfig,
}: CompositionLineChartProps) {
    return (
        <AreaChart
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
                <Area
                    key={specimenClass}
                    type="monotone"
                    dataKey={specimenClass}
                    fill={specimenChartConfig[specimenClass]?.color}
                    stroke={specimenChartConfig[specimenClass]?.color}
                    fillOpacity={0.2}
                    strokeWidth={3}
                    dot={{
                        r: 2,
                        fillOpacity: 1,
                    }}
                />
            ))}
            <ChartLegend
                wrapperStyle={{ paddingTop: '1rem' }}
                content={
                    <ChartLegendContent className="text-muted-foreground flex-wrap" />
                }
            />
        </AreaChart>
    );
}
