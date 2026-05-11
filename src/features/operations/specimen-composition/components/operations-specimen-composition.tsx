'use client';

import { useGetMonthlySpecimensCount } from '@/api/specimen/hooks/use-get-monthly-specimens-count';
import type { GetMonthlySpecimensCountQueryParams } from '@/api/specimen/validation/get-monthly-specimens-count-schema';
import CompositionChartPair from './composition-chart-pair';
import type { SpecimenClassificationAxis } from '@/api/specimen/validation/specimen-schema';
import {
    buildSpecimenChartConfig,
    groupSpecimenCountsByMonth,
    sumSpecimenCountsByClass,
} from '../utils/specimen-composition-helpers';
import type { LocationQueryParam } from '@/lib/location/location-query';

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

    if (isGetMonthlySpecimensCountPending || !getMonthlySpecimensCountResult) {
        return <h1>LOADING...</h1>;
    }

    if (!getMonthlySpecimensCountResult.ok) {
        return <h1>ERROR: {getMonthlySpecimensCountResult.error.message}</h1>;
    }

    const monthlySpecimenCounts = getMonthlySpecimensCountResult.data.data;

    return (
        <div className="space-y-6">
            {COMPOSITION_SECTIONS.map(
                ({ specimenClassificationAxis, title }) => {
                    const specimenCountsByClass = sumSpecimenCountsByClass(
                        specimenClassificationAxis,
                        monthlySpecimenCounts,
                    );
                    const specimenCountsByMonth = groupSpecimenCountsByMonth(
                        specimenClassificationAxis,
                        monthlySpecimenCounts,
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
