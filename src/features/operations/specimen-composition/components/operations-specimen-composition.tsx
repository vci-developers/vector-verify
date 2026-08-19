'use client';

import { useGetMonthlySpecimensCount } from '@/api/specimen/hooks/use-get-monthly-specimens-count';
import type { GetMonthlySpecimensCountQueryParams } from '@/api/specimen/validation/get-monthly-specimens-count-schema';
import CompositionChartPair from '@/features/operations/specimen-composition/components/composition-chart-pair';
import type { SpecimenClassificationAxis } from '@/api/specimen/validation/specimen-schema';
import {
    buildSpecimenChartConfig,
    isNonMosquito,
    getSpeciesOptions,
    groupSpecimenCountsByMonth,
    sumSpecimenCountsByClass,
} from '../utils/specimen-composition-helpers';
import {
    MultiSelect,
    MultiSelectTrigger,
    MultiSelectValue,
    MultiSelectItem,
    MultiSelectContent,
    MultiSelectGroup,
} from '@/components/ui/multi-select';
import { useMemo, useState } from 'react';
import { useOperationsFilters } from '@/features/operations/view-state/use-operations-filters';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import EmptyBanner from '@/components/ui/empty-banner';
import { BarChart3, LineChart } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import ErrorBanner from '@/components/ui/error-banner';

const COMPOSITION_SECTIONS: {
    specimenClassificationAxis: SpecimenClassificationAxis;
    title: string;
}[] = [
    { specimenClassificationAxis: 'species', title: 'Species' },
    { specimenClassificationAxis: 'sex', title: 'Sex' },
    { specimenClassificationAxis: 'abdomenStatus', title: 'Abdomen Status' },
];

interface OperationsSpecimenCompositionProps {
    siteIds: number[];
    startDate: string;
    endDate: string;
}

type ChartType = 'bar' | 'line';

export default function OperationsSpecimenComposition({
    siteIds,
    startDate,
    endDate,
}: OperationsSpecimenCompositionProps) {
    const t = useTranslations('OperationsSpecimenComposition');
    const getMonthlySpecimensCountQueryParams: GetMonthlySpecimensCountQueryParams =
        {
            startDate,
            endDate,
            sessionType: 'SURVEILLANCE',
            siteIds,
        };

    const {
        data: getMonthlySpecimensCountResult,
        isPending: isGetMonthlySpecimensCountPending,
    } = useGetMonthlySpecimensCount(getMonthlySpecimensCountQueryParams);

    const [chartType, setChartType] = useState<ChartType>('bar');

    const [{ selectedSpecies }, setFilters] = useOperationsFilters();
    const speciesOptions = useMemo(() => {
        if (!getMonthlySpecimensCountResult?.ok) return [];
        return getSpeciesOptions(getMonthlySpecimensCountResult.data.data);
    }, [getMonthlySpecimensCountResult]);

    const validSelectedSpecies = useMemo(() => {
        const validOptions = new Set(speciesOptions);
        const species =
            selectedSpecies ??
            speciesOptions.filter(species => !isNonMosquito(species));
        return species.filter(speciesName => validOptions.has(speciesName));
    }, [selectedSpecies, speciesOptions]);

    const isLoading =
        isGetMonthlySpecimensCountPending || !getMonthlySpecimensCountResult;
    const isError = !isLoading && !getMonthlySpecimensCountResult.ok;

    const monthlySpecimenCounts = getMonthlySpecimensCountResult?.ok
        ? getMonthlySpecimensCountResult.data.data
        : undefined;

    return (
        <div className="space-y-6">
            {isError && (
                <ErrorBanner message={t('monthlySpecimenCountsError')} />
            )}
            <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">
                    {t('filterBySpecies')}
                </Label>
                <div className="flex justify-between gap-2">
                    <MultiSelect
                        values={validSelectedSpecies}
                        onValuesChange={species =>
                            setFilters({ selectedSpecies: species })
                        }
                    >
                        <MultiSelectTrigger
                            disabled={isLoading || isError}
                            className="min-w-0 flex-1"
                        >
                            <MultiSelectValue
                                placeholder={t('selectSpecies')}
                            />
                        </MultiSelectTrigger>
                        <MultiSelectContent
                            search={{
                                placeholder: t('searchSpecies'),
                                emptyMessage: t('noSpeciesFound'),
                            }}
                        >
                            <MultiSelectGroup>
                                {speciesOptions.map(species => (
                                    <MultiSelectItem
                                        key={species}
                                        value={species}
                                    >
                                        {species}
                                    </MultiSelectItem>
                                ))}
                            </MultiSelectGroup>
                        </MultiSelectContent>
                    </MultiSelect>
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        size="sm"
                        value={chartType}
                        onValueChange={(next: ChartType | '') => {
                            if (next) setChartType(next);
                        }}
                        disabled={isLoading || isError}
                        className="shrink-0"
                    >
                        <ToggleGroupItem value="bar">
                            <BarChart3 />
                            {t('barChart')}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="line">
                            <LineChart />
                            {t('lineChart')}
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </div>
            {isLoading ? (
                COMPOSITION_SECTIONS.map(
                    ({ specimenClassificationAxis, title }) => (
                        <CompositionChartPair
                            key={specimenClassificationAxis}
                            title={title}
                            chartType={chartType}
                            specimenCountsByClass={[]}
                            specimenCountsByMonth={[]}
                            specimenChartConfig={{}}
                            isLoading={isLoading}
                            isError={isError}
                        />
                    ),
                )
            ) : !isError && validSelectedSpecies.length === 0 ? (
                <EmptyBanner message={t('monthlySpecimenCountsEmpty')} />
            ) : (
                monthlySpecimenCounts &&
                COMPOSITION_SECTIONS.map(
                    ({ specimenClassificationAxis, title }) => {
                        const specimenCountsByClass = sumSpecimenCountsByClass(
                            specimenClassificationAxis,
                            monthlySpecimenCounts,
                            validSelectedSpecies,
                        );
                        const specimenCountsByMonth =
                            groupSpecimenCountsByMonth(
                                specimenClassificationAxis,
                                monthlySpecimenCounts,
                                validSelectedSpecies,
                            );
                        const specimenChartConfig = buildSpecimenChartConfig(
                            specimenClassificationAxis,
                            specimenCountsByClass.map(
                                ({ specimenClass }) => specimenClass,
                            ),
                        );

                        return (
                            <CompositionChartPair
                                key={specimenClassificationAxis}
                                title={title}
                                chartType={chartType}
                                specimenCountsByClass={specimenCountsByClass}
                                specimenCountsByMonth={specimenCountsByMonth}
                                specimenChartConfig={specimenChartConfig}
                                isLoading={isLoading}
                                isError={isError}
                            />
                        );
                    },
                )
            )}
        </div>
    );
}
