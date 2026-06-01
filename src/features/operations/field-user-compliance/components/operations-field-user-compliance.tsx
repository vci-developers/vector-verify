'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import type { LocationQueryParam } from '@/lib/location/location-query';
import { buildFieldUserComplianceData } from '@/features/operations/field-user-compliance/utils/field-user-compliance-data';
import { eachMonthOfInterval, format, parseISO } from 'date-fns';
import { useMemo } from 'react';
import FieldUserComplianceChart from '@/features/operations/field-user-compliance/components/field-user-compliance-chart';

interface OperationsFieldUserComplianceProps {
    locationQueryParam: LocationQueryParam;
    startDate: string;
    endDate: string;
}

export default function OperationsFieldUserCompliance({
    locationQueryParam,
    startDate,
    endDate,
}: OperationsFieldUserComplianceProps) {
    const {
        data: getAllSessionsResult,
        isPending,
        refetch,
    } = useGetAllSessions({
        ...locationQueryParam,
        startDate,
        endDate,
    });

    const { months, monthYearKeys } = useMemo(() => {
        const months = eachMonthOfInterval({
            start: parseISO(startDate),
            end: parseISO(endDate),
        });
        return {
            months,
            monthYearKeys: months.map(month => format(month, 'yyyy-MM')),
        };
    }, [startDate, endDate]);

    if (isPending || !getAllSessionsResult) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!getAllSessionsResult.ok) {
        return <ErrorState onRetry={refetch} cardClassName="h-64 w-full" />;
    }

    const { collectorRows, totalCollectors, activeCollectors } =
        buildFieldUserComplianceData(
            getAllSessionsResult.data.sessions,
            monthYearKeys,
        );

    return (
        <FieldUserComplianceChart
            months={months}
            collectorRows={collectorRows}
            totalCollectors={totalCollectors}
            activeCollectors={activeCollectors}
        />
    );
}
