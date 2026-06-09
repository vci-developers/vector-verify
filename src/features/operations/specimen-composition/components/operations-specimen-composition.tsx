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
import type { LocationQueryParam } from '@/lib/location/location-query';
import {
    MultiSelect,
    MultiSelectTrigger,
    MultiSelectValue,
    MultiSelectItem,
    MultiSelectContent,
    MultiSelectGroup,
} from '@/components/ui/multi-select';
import { useMemo } from 'react';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { StorageKeys } from '@/lib/storage-keys';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

const COMPOSITION_SECTIONS: {
    specimenClassificationAxis: SpecimenClassificationAxis;
    title: string;
}[] = [
    { specimenClassificationAxis: 'species', title: 'Species' },
    { specimenClassificationAxis: 'sex', title: 'Sex' },
    { specimenClassificationAxis: 'abdomenStatus', title: 'Abdomen Status' },
];

interface OperationsSpecimenCompositionProps {
    locationQueryParam: LocationQueryParam;
    startDate: string;
    endDate: string;
}

export default function OperationsSpecimenComposition({
    locationQueryParam,
    startDate,
    endDate,
}: OperationsSpecimenCompositionProps) {
    const t = useTranslations('OperationsSpecimenComposition');
    const locationFilter =
        'district' in locationQueryParam
            ? { districts: [locationQueryParam.district] }
            : { siteIds: [locationQueryParam.siteId] };

    const getMonthlySpecimensCountQueryParams: GetMonthlySpecimensCountQueryParams =
        {
            startDate,
            endDate,
            sessionType: 'SURVEILLANCE',
            ...locationFilter,
        };

    const {
        data: getMonthlySpecimensCountResult,
        isPending: isGetMonthlySpecimensCountPending,
    } = useGetMonthlySpecimensCount(getMonthlySpecimensCountQueryParams);

    const [storedSpecies, setStoredSpecies] = useLocalStorage<string[] | null>(
        StorageKeys.operations.selectedSpecies,
        null,
    );
    const speciesOptions = useMemo(() => {
        if (!getMonthlySpecimensCountResult?.ok) return [];
        return getSpeciesOptions(getMonthlySpecimensCountResult.data.data);
    }, [getMonthlySpecimensCountResult]);

    const validSelectedSpecies = useMemo(() => {
        const validOptions = new Set(speciesOptions);
        const species =
            storedSpecies ??
            speciesOptions.filter(species => !isNonMosquito(species));
        return species.filter(s => validOptions.has(s));
    }, [storedSpecies, speciesOptions]);

    if (isGetMonthlySpecimensCountPending || !getMonthlySpecimensCountResult) {
        return <h1>{t('capsLoading')}</h1>;
    }

    if (!getMonthlySpecimensCountResult.ok) {
        return (
            <h1>
                {t('capsError')}
                {getMonthlySpecimensCountResult.error.message}
            </h1>
        );
    }

    const monthlySpecimenCounts = getMonthlySpecimensCountResult.data.data;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">
                    {t('filterBySpecies')}
                </Label>
                <MultiSelect
                    values={validSelectedSpecies}
                    onValuesChange={setStoredSpecies}
                >
                    <MultiSelectTrigger>
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
                        <CompositionChartPair
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
