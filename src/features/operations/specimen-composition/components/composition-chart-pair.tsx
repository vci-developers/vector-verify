'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-6 lg:flex-row">
                    <div className="h-62.5 w-62.5 shrink-0">
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
                                        ({ specimenClass, specimenCount }) => ({
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
                                                                    0) + 24
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
                    <div className="h-62.5 w-full min-w-0 flex-1">
                        <ChartContainer
                            config={specimenChartConfig}
                            className="h-full w-full"
                        >
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
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                >
                                    <Label
                                        value="Month"
                                        position="bottom"
                                        className="fill-muted-foreground text-sm font-bold"
                                    />
                                </XAxis>
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    width={44}
                                >
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
                                        fill={
                                            specimenChartConfig[specimenClass]
                                                ?.color
                                        }
                                        stroke={
                                            specimenChartConfig[specimenClass]
                                                ?.color
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
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
                    {specimenClasses.map(specimenClass => (
                        <span
                            key={specimenClass}
                            className="flex items-center gap-1.5"
                        >
                            <span
                                className="inline-block h-3 w-3 shrink-0 rounded-full"
                                style={{
                                    backgroundColor:
                                        specimenChartConfig[specimenClass]
                                            ?.color,
                                }}
                            />
                            <span className="text-muted-foreground text-sm">
                                {specimenChartConfig[specimenClass]?.label}
                            </span>
                        </span>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
