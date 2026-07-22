'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { Label, Pie, PieChart } from 'recharts';
import CompositionLineChart from '@/features/operations/specimen-composition/components/composition-line-chart';
import CompositionBarChart from '@/features/operations/specimen-composition/components/composition-bar-chart';

type ChartType = 'bar' | 'line';

interface CompositionChartPairProps {
    title: string;
    chartType: ChartType;
    specimenCountsByClass: {
        specimenClass: string;
        specimenCount: number;
    }[];
    specimenCountsByMonth: Record<string, string | number>[];
    specimenChartConfig: ChartConfig;
}

export default function CompositionChartPair({
    title,
    chartType,
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
                    <div className="h-72 w-full min-w-0 flex-1">
                        <ChartContainer
                            config={specimenChartConfig}
                            className="h-full w-full"
                        >
                            {chartType === 'bar' ? (
                                <CompositionBarChart
                                    specimenClasses={specimenClasses}
                                    specimenCountsByMonth={
                                        specimenCountsByMonth
                                    }
                                    specimenChartConfig={specimenChartConfig}
                                />
                            ) : (
                                <CompositionLineChart
                                    specimenClasses={specimenClasses}
                                    specimenCountsByMonth={
                                        specimenCountsByMonth
                                    }
                                    specimenChartConfig={specimenChartConfig}
                                />
                            )}
                        </ChartContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
