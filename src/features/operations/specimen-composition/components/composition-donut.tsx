'use client';

import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import CompositionBreakdown from '@/features/operations/specimen-composition/components/composition-breakdown';
import { useFormatter, useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';
import { Pie, PieChart } from 'recharts';

interface CompositionDonutProps {
    specimenCountsByClass: {
        specimenClass: string;
        specimenCount: number;
    }[];
    totalSpecimenCount: number;
    specimenChartConfig: ChartConfig;
    isLoading: boolean;
    isError: boolean;
}

export default function CompositionDonut({
    specimenCountsByClass,
    totalSpecimenCount,
    specimenChartConfig,
    isLoading,
    isError,
}: CompositionDonutProps) {
    const t = useTranslations('OperationsSpecimenComposition');
    const format = useFormatter();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const specimenClasses = Object.keys(specimenChartConfig);
    const specimenCountsInChartOrder = [...specimenCountsByClass].sort(
        (first, second) =>
            specimenClasses.indexOf(first.specimenClass) -
            specimenClasses.indexOf(second.specimenClass),
    );
    const hoveredClassCount =
        hoveredIndex === null
            ? null
            : (specimenCountsInChartOrder[hoveredIndex] ?? null);

    if (isLoading || isError) {
        return (
            <Skeleton
                className="h-62.5 w-62.5 shrink-0 rounded-full"
                variant={isError ? 'destructive' : 'default'}
            />
        );
    }

    return (
        <div className="flex w-62.5 shrink-0 flex-col gap-4">
            <div className="relative h-62.5 w-62.5">
                <ChartContainer
                    config={specimenChartConfig}
                    className="h-full w-full"
                >
                    <PieChart>
                        <Pie
                            data={specimenCountsInChartOrder.map(
                                ({ specimenClass, specimenCount }, index) => ({
                                    specimenClass,
                                    specimenCount,
                                    fill: specimenChartConfig[specimenClass]
                                        ?.color,
                                    fillOpacity:
                                        hoveredIndex === null ||
                                        hoveredIndex === index
                                            ? 1
                                            : 0.3,
                                }),
                            )}
                            nameKey="specimenClass"
                            dataKey="specimenCount"
                            innerRadius={60}
                            outerRadius={80}
                            stroke="var(--card)"
                            strokeWidth={2}
                            onMouseEnter={(_, index) => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        />
                    </PieChart>
                </ChartContainer>
                <p
                    aria-live="polite"
                    className="pointer-events-none absolute top-1/2 left-1/2 flex w-26 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 text-center leading-tight"
                >
                    {hoveredClassCount ? (
                        <Fragment>
                            <span className="text-foreground text-2xl font-bold tabular-nums">
                                {format.number(
                                    hoveredClassCount.specimenCount /
                                        totalSpecimenCount,
                                    {
                                        style: 'percent',
                                        maximumFractionDigits: 1,
                                    },
                                )}
                            </span>
                            <span className="text-foreground line-clamp-2 w-full text-xs font-medium">
                                {specimenChartConfig[
                                    hoveredClassCount.specimenClass
                                ]?.label ?? hoveredClassCount.specimenClass}
                            </span>
                            <span className="text-muted-foreground text-xs tabular-nums">
                                {t('specimenCountOfTotal', {
                                    count: format.number(
                                        hoveredClassCount.specimenCount,
                                    ),
                                    total: format.number(totalSpecimenCount),
                                })}
                            </span>
                        </Fragment>
                    ) : (
                        <Fragment>
                            <span className="text-foreground text-3xl font-bold tabular-nums">
                                {format.number(totalSpecimenCount)}
                            </span>
                            <span className="text-muted-foreground text-sm">
                                {t('specimens')}
                            </span>
                        </Fragment>
                    )}
                </p>
            </div>
            <CompositionBreakdown
                specimenCountsByClass={specimenCountsInChartOrder}
                totalSpecimenCount={totalSpecimenCount}
                specimenChartConfig={specimenChartConfig}
                highlightedSpecimenClass={hoveredClassCount?.specimenClass}
                className="text-sm"
            />
        </div>
    );
}
