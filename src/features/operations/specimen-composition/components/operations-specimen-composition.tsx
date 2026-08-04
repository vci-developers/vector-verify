'use client';

import { useGetMonthlySpecimensCount } from '@/api/specimen/hooks/use-get-monthly-specimens-count';
import type { GetMonthlySpecimensCountQueryParams } from '@/api/specimen/validation/get-monthly-specimens-count-schema';
import CompositionChartPair from './composition-chart-pair';
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
import { SkeletonList } from '@/components/ui/skeleton-list';
import EmptyBanner from '@/components/ui/empty-banner';

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

    const isLoading =
        isGetMonthlySpecimensCountPending || !getMonthlySpecimensCountResult;

    if (!isLoading && !getMonthlySpecimensCountResult.ok) {
        return (
            <h1>
                {t('monthlySpecimenCountsError')}
                {getMonthlySpecimensCountResult.error.message}
            </h1>
        );
    }

    const monthlySpecimenCounts = getMonthlySpecimensCountResult?.ok
        ? getMonthlySpecimensCountResult.data.data
        : undefined;

    return (
        <div className="space-y-6">
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
                    <MultiSelectTrigger disabled={isLoading}>
                        <MultiSelectValue placeholder={t('selectSpecies')} />
                    </MultiSelectTrigger>
                    <MultiSelectContent
                        search={{
                            placeholder: t('searchSpecies'),
                            emptyMessage: t('noSpeciesFound'),
                        }}
                    >
                        <MultiSelectGroup>
                            {speciesOptions.map(species => (
                                <MultiSelectItem key={species} value={species}>
                                    {species}
                                </MultiSelectItem>
                            ))}
                        </MultiSelectGroup>
                    </MultiSelectContent>
                </MultiSelect>
            </div>
            {isLoading ? (
                <SkeletonList count={3} className="h-72" width="full" />
            ) : validSelectedSpecies.length === 0 ? (
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
                                specimenCountsByClass={specimenCountsByClass}
                                specimenCountsByMonth={specimenCountsByMonth}
                                specimenChartConfig={specimenChartConfig}
                            />
                        );
                    },
                )
            )}
        </div>
    );
}
