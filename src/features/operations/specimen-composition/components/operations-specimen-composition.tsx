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
import { useMemo, useState } from 'react';

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

    const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);

    const speciesOptions = useMemo(() => {
        if (!getMonthlySpecimensCountResult?.ok) return [];
        return getSpeciesOptions(getMonthlySpecimensCountResult.data.data);
    }, [getMonthlySpecimensCountResult]);

    const validSelectedSpecies = useMemo(() => {
        const validOptions = new Set(speciesOptions);
        return selectedSpecies.filter(value => validOptions.has(value));
    }, [selectedSpecies, speciesOptions]);

    const [filterInitialized, setFilterInitialized] = useState(false);
    if (speciesOptions.length > 0 && !filterInitialized) {
        setSelectedSpecies(
            speciesOptions.filter(species => !isNonMosquito(species)),
        );
        setFilterInitialized(true);
    }

    if (isGetMonthlySpecimensCountPending || !getMonthlySpecimensCountResult) {
        return <h1>LOADING...</h1>;
    }

    if (!getMonthlySpecimensCountResult.ok) {
        return <h1>ERROR: {getMonthlySpecimensCountResult.error.message}</h1>;
    }

    const monthlySpecimenCounts = getMonthlySpecimensCountResult.data.data;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Filter by Species</label>
                <MultiSelect
                    values={validSelectedSpecies}
                    onValuesChange={setSelectedSpecies}
                >
                    <MultiSelectTrigger>
                        <MultiSelectValue placeholder="Select species..." />
                    </MultiSelectTrigger>
                    <MultiSelectContent
                        search={{
                            placeholder: 'Search species...',
                            emptyMessage: 'No species found.',
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
                        selectedSpecies,
                    );
                    const specimenCountsByMonth = groupSpecimenCountsByMonth(
                        specimenClassificationAxis,
                        monthlySpecimenCounts,
                        selectedSpecies,
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
