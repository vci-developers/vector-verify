'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Label,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from 'recharts';
import { Fragment } from 'react/jsx-runtime';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

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
    isLoading: boolean;
}

export default function CompositionChartPair({
    title,
    chartType,
    specimenCountsByClass,
    specimenCountsByMonth,
    specimenChartConfig,
    isLoading,
}: CompositionChartPairProps) {
    const t = useTranslations('OperationsSpecimenComposition');
    const specimenClasses = Object.keys(specimenChartConfig);
    const totalSpecimenCount = specimenCountsByClass.reduce(
        (sum, { specimenCount }) => sum + specimenCount,
        0,
    );

    const chartMargins = {
        top: 8,
        right: 12,
        bottom: 32,
        left: 12,
    };

    const chartAxes = (
        <Fragment>
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
        </Fragment>
    );

    const chartLegend = (
        <ChartLegend
            wrapperStyle={{ paddingTop: '1rem' }}
            content={
                <ChartLegendContent className="text-muted-foreground flex-wrap" />
            }
        />
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {totalSpecimenCount === 0 ? (
                    <div className="text-muted-foreground flex items-center justify-center py-12 text-sm">
                        {t('noSpecimenData')}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6 lg:flex-row">
                        <div className="h-62.5 w-62.5 shrink-0">
                            {isLoading ? (
                                <Skeleton className="h-full w-full rounded-full" />
                            ) : (
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
                                                                    x={
                                                                        viewBox.cx
                                                                    }
                                                                    y={
                                                                        viewBox.cy
                                                                    }
                                                                    className="fill-foreground text-3xl font-bold"
                                                                >
                                                                    {totalSpecimenCount.toLocaleString()}
                                                                </tspan>
                                                                <tspan
                                                                    x={
                                                                        viewBox.cx
                                                                    }
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
                            )}
                        </div>
                        <div className="h-72 w-full min-w-0 flex-1">
                            {isLoading ? (
                                <Skeleton className="h-64 w-full" />
                            ) : (
                                <ChartContainer
                                    config={specimenChartConfig}
                                    className="h-full w-full"
                                >
                                    {chartType === 'bar' ? (
                                        <BarChart
                                            data={specimenCountsByMonth}
                                            margin={chartMargins}
                                        >
                                            {chartAxes}
                                            {specimenClasses.map(
                                                specimenClass => (
                                                    <Bar
                                                        key={specimenClass}
                                                        dataKey={specimenClass}
                                                        stackId="specimens"
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
                                                        fillOpacity={0.75}
                                                        strokeWidth={1}
                                                    />
                                                ),
                                            )}
                                            {chartLegend}
                                        </BarChart>
                                    ) : (
                                        <AreaChart
                                            data={specimenCountsByMonth}
                                            margin={chartMargins}
                                        >
                                            {chartAxes}
                                            {specimenClasses.map(
                                                specimenClass => (
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
                                                ),
                                            )}
                                            {chartLegend}
                                        </AreaChart>
                                    )}
                                </ChartContainer>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
