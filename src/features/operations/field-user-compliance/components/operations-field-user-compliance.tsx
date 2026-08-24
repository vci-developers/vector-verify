'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { Skeleton } from '@/components/ui/skeleton';
import { buildFieldUserComplianceData } from '@/features/operations/field-user-compliance/utils/field-user-compliance-data';
import { eachMonthOfInterval, format, parseISO } from 'date-fns';
import { useMemo } from 'react';
import FieldUserComplianceChart from '@/features/operations/field-user-compliance/components/field-user-compliance-chart';

interface OperationsFieldUserComplianceProps {
    siteIds: number[];
    siteIdToLocationLabel: Map<number, string>;
    startDate: string;
    endDate: string;
}

export default function OperationsFieldUserCompliance({
    siteIds,
    siteIdToLocationLabel,
    startDate,
    endDate,
}: OperationsFieldUserComplianceProps) {
    const { data: getAllSessionsResult, isPending } = useGetAllSessions({
        siteIds,
        startDate,
        endDate,
        type: 'SURVEILLANCE',
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
            monthYearKeys,
            siteIdToLocationLabel,
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
