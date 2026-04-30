'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import CompositionChartKey from './composition-chart-key';
import CompositionEmptyChartPanel from './composition-empty-chart-panel';
import { ChartPie, TrendingUp } from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Label,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from 'recharts';

interface CompositionChartPairProps {
    title: string;
    specimenCountsByClass: {
        specimenClass: string;
        specimenCount: number;
    }[];
    specimenCountsByMonth: Record<string, string | number>[];
    specimenChartConfig: ChartConfig;
}

export default function CompositionChartPair({
    title,
    specimenCountsByClass,
    specimenCountsByMonth,
    specimenChartConfig,
}: CompositionChartPairProps) {
    const specimenClasses = Object.keys(specimenChartConfig);
    const totalSpecimenCount = specimenCountsByClass.reduce(
        (sum, { specimenCount }) => sum + specimenCount,
        0,
    );
    const hasSpecimenData =
        specimenCountsByClass.length > 0 && totalSpecimenCount > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {hasSpecimenData ? (
                    <div className="grid items-center gap-6 xl:grid-cols-[250px_minmax(0,1fr)_280px]">
                        <div className="h-62.5 w-62.5 justify-self-center">
                            <ChartContainer
                                config={specimenChartConfig}
                                className="h-full w-full"
                            >
                                <PieChart>
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                className="min-w-45"
                                                indicator="line"
                                            />
                                        }
                                    />
                                    <Pie
                                        data={specimenCountsByClass.map(
                                            ({
                                                specimenClass,
                                                specimenCount,
                                            }) => ({
                                                specimenClass,
                                                specimenCount,
                                                fill: specimenChartConfig[
                                                    specimenClass
                                                ]?.color,
                                            }),
                                        )}
                                        nameKey="specimenClass"
                                        dataKey="specimenCount"
                                        innerRadius={60}
                                        outerRadius={80}
                                        strokeWidth={5}
                                    >
                                        <Label
                                            content={({ viewBox }) => {
                                                if (
                                                    viewBox &&
                                                    'cx' in viewBox &&
                                                    'cy' in viewBox
                                                ) {
                                                    return (
                                                        <text
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                        >
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                className="fill-foreground text-3xl font-bold"
                                                            >
                                                                {totalSpecimenCount.toLocaleString()}
                                                            </tspan>
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={
                                                                    (viewBox.cy ||
                                                                        0) +
                                                                    24
                                                                }
                                                                className="fill-muted-foreground"
                                                            >
                                                                Specimens
                                                            </tspan>
                                                        </text>
                                                    );
                                                }
                                            }}
                                        />
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        </div>
                        <div className="h-62.5 w-full min-w-0">
                            <ChartContainer
                                config={specimenChartConfig}
                                className="h-full w-full"
                            >
                                <AreaChart data={specimenCountsByMonth}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                    />
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
                                            fill={
                                                specimenChartConfig[
                                                    specimenClass
                                                ]?.color
                                            }
                                            stroke={
                                                specimenChartConfig[
                                                    specimenClass
                                                ]?.color
                                            }
                                            fillOpacity={0.2}
                                            strokeWidth={3}
                                            dot={{
                                                r: 2,
                                                fillOpacity: 1,
                                            }}
                                        />
                                    ))}
                                </AreaChart>
                            </ChartContainer>
                        </div>
                        <CompositionChartKey
                            specimenCountsByClass={specimenCountsByClass}
                            specimenChartConfig={specimenChartConfig}
                            totalSpecimenCount={totalSpecimenCount}
                        />
                    </div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_280px]">
                        <CompositionEmptyChartPanel
                            icon={ChartPie}
                            title="No composition data"
                            description={`No ${title.toLowerCase()} counts were recorded for this period.`}
                        />
                        <CompositionEmptyChartPanel
                            icon={TrendingUp}
                            title="No monthly trend"
                            description="Trend lines will appear once there are specimens in the selected range."
                        />
                        <CompositionChartKey
                            specimenCountsByClass={specimenCountsByClass}
                            specimenChartConfig={specimenChartConfig}
                            totalSpecimenCount={totalSpecimenCount}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
