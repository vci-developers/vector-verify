'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { Skeleton } from '@/components/ui/skeleton';
import type { LocationQueryParam } from '@/lib/location/location-query';
import { buildFieldUserComplianceData } from '@/features/operations/utils/field-user-compliance-data';
import { eachMonthOfInterval, format, parseISO } from 'date-fns';
import { useMemo } from 'react';
import FieldUserComplianceChart from '@/features/operations/components/field-user-compliance/field-user-compliance-chart';

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
    const { data: getAllSessionsResult, isPending } = useGetAllSessions({
        ...locationQueryParam,
        startDate,
        endDate,
    });

    const { months, monthKeys } = useMemo(() => {
        const months = eachMonthOfInterval({
            start: parseISO(startDate),
            end: parseISO(endDate),
        });
        return {
            months,
            monthKeys: months.map(month => format(month, 'yyyy-MM')),
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
        return (
            <p className="text-destructive text-sm">
                {getAllSessionsResult.error.message}
            </p>
        );
    }

    const { collectorRows, totalCollectors, activeCollectors } =
        buildFieldUserComplianceData(
            getAllSessionsResult.data.sessions,
            monthKeys,
        );

    return (
        <FieldUserComplianceChart
            months={months}
            monthKeys={monthKeys}
            collectorRows={collectorRows}
            totalCollectors={totalCollectors}
            activeCollectors={activeCollectors}
        />
    );
}
