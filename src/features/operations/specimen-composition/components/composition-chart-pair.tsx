'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    type ChartConfig,
} from '@/components/ui/chart';
import CompositionBreakdown from '@/features/operations/specimen-composition/components/composition-breakdown';
import CompositionDonut from '@/features/operations/specimen-composition/components/composition-donut';
import { Bar, BarChart, CartesianGrid, Label, XAxis, YAxis } from 'recharts';
import { Fragment } from 'react/jsx-runtime';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import EmptyBanner from '@/components/ui/empty-banner';

interface CompositionChartPairProps {
    title: string;
    specimenCountsByClass: {
        specimenClass: string;
        specimenCount: number;
    }[];
    specimenCountsByMonth: Record<string, string | number>[];
    specimenChartConfig: ChartConfig;
    isLoading: boolean;
    isError: boolean;
}

export default function CompositionChartPair({
    title,
    specimenCountsByClass,
    specimenCountsByMonth,
    specimenChartConfig,
    isLoading,
    isError,
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
                content={({ active, payload, label }) =>
                    active && payload?.length ? (
                        <div className="border-border/50 bg-background rounded-lg border px-2.5 py-1.5 shadow-xl">
                            <CompositionBreakdown
                                heading={String(label)}
                                specimenCountsByClass={payload.map(item => ({
                                    specimenClass: String(item.dataKey),
                                    specimenCount: Number(item.value),
                                }))}
                                totalSpecimenCount={payload.reduce(
                                    (sum, item) => sum + Number(item.value),
                                    0,
                                )}
                                specimenChartConfig={specimenChartConfig}
                            />
                        </div>
                    ) : null
                }
            />
        </Fragment>
    );

    const chartLegend = (
        <ChartLegend
            wrapperStyle={{ paddingTop: '1rem' }}
            itemSorter={null}
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
                {!isLoading && !isError && totalSpecimenCount === 0 ? (
                    <EmptyBanner message={t('noSpecimenData')} />
                ) : (
                    <div className="flex flex-col items-center gap-6 lg:flex-row">
                        <CompositionDonut
                            specimenCountsByClass={specimenCountsByClass}
                            totalSpecimenCount={totalSpecimenCount}
                            specimenChartConfig={specimenChartConfig}
                            isLoading={isLoading}
                            isError={isError}
                        />
                        <div className="h-72 w-full min-w-0 flex-1">
                            {isLoading || isError ? (
                                <Skeleton
                                    className="h-64 w-full"
                                    variant={
                                        isError ? 'destructive' : 'default'
                                    }
                                />
                            ) : (
                                <ChartContainer
                                    config={specimenChartConfig}
                                    className="h-full w-full"
                                >
                                    <BarChart
                                        data={specimenCountsByMonth}
                                        margin={chartMargins}
                                    >
                                        {chartAxes}
                                        {specimenClasses.map(specimenClass => (
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
                                        ))}
                                        {chartLegend}
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
