'use client';

import { useGetMonthlySpecimensCount } from '@/api/specimen/hooks/use-get-monthly-specimens-count';
import type { GetMonthlySpecimensCountQueryParams } from '@/api/specimen/validation/get-monthly-specimens-count-schema';
import CompositionChartPairLineChart from './composition-chart-pair-line-chart';
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
import { useMemo } from 'react';
import { useOperationsFilters } from '@/features/operations/view-state/use-operations-filters';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { Toggle } from '@/components/ui/toggle';
import CompositionChartPairBarChart from './composition-chart-pair-bar-chart';

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

    if (isGetMonthlySpecimensCountPending || !getMonthlySpecimensCountResult) {
        return <h1>{t('monthlySpecimenCountsLoading')}</h1>;
    }

    if (!getMonthlySpecimensCountResult.ok) {
        return (
            <h1>
                {t('monthlySpecimenCountsError')}
                {getMonthlySpecimensCountResult.error.message}
            </h1>
        );
    }

    const monthlySpecimenCounts = getMonthlySpecimensCountResult.data.data;

    return (
        <div className="space-y-6">
            <div className="flex-gap flex justify-between">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">
                        {t('filterBySpecies')}
                    </Label>
                    <MultiSelect
                        values={validSelectedSpecies}
                        onValuesChange={species =>
                            setFilters({ selectedSpecies: species })
                        }
                    >
                        <MultiSelectTrigger>
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
                </div>
                <Toggle>toggle</Toggle>
            </div>
            {COMPOSITION_SECTIONS.map(
                ({ specimenClassificationAxis, title }) => {
                    const specimenCountsByClass = sumSpecimenCountsByClass(
                        specimenClassificationAxis,
                        monthlySpecimenCounts,
                        validSelectedSpecies,
                    );
                    const specimenCountsByMonth = groupSpecimenCountsByMonth(
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
                        // <CompositionChartPairLineChart
                        //     key={specimenClassificationAxis}
                        //     title={title}
                        //     specimenCountsByClass={specimenCountsByClass}
                        //     specimenCountsByMonth={specimenCountsByMonth}
                        //     specimenChartConfig={specimenChartConfig}
                        // />
                        <CompositionChartPairBarChart
                            key={specimenClassificationAxis}
                            title={title}
                            specimenCountsByClass={specimenCountsByClass}
                            specimenCountsByMonth={specimenCountsByMonth}
                            specimenChartConfig={specimenChartConfig}
                        />
                    );
                },
            )}
        </div>
    );
}
