'use client';

import { useEffect, useState, useCallback } from "react";
import type { GetSpecimensQueryParams } from "@/api/specimen/validation/get-specimens-schema";
import type { GetSessionsQueryParams } from "@/api/session/validation/get-sessions-schema";
import { useGetSessions } from "@/api/session/hooks/use-get-sessions";
import { useGetSpecimens } from "@/api/specimen/hooks/use-get-specimens";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

function getCompletenessColor(percentage: number): string {
    if (percentage >= 80) return "bg-success/10 text-success border-success/50";
    if (percentage >= 50) return "bg-warning/20 text-warning-foreground border-warning/50";
    return "bg-destructive/20 text-destructive border-destructive/50";
}

function CompletenessBox({ percentage, isLoading }: { percentage: number; isLoading: boolean }) {
    if (isLoading) {
        return <span className="px-2 py-1 rounded border bg-muted text-muted-foreground border-border">...%</span>;
    }
    return (
        <span className={`px-2 py-1 rounded border ${getCompletenessColor(percentage)}`}>
            {percentage}%
        </span>
    );
}

function useSiteTotals(siteId: number) {
    const getSessionsQueryParams: GetSessionsQueryParams = { siteId };
    const getSpecimensQueryParams: GetSpecimensQueryParams = { siteId };

    const {
        data: getSessionsResult,
        isPending: isGetSessionsPending,
    } = useGetSessions(getSessionsQueryParams);

    const {
        data: getSpecimensResult,
        isPending: isGetSpecimensPending,
    } = useGetSpecimens(getSpecimensQueryParams);

    return {
        sessions: getSessionsResult?.ok ? getSessionsResult.data.total : 0,
        specimens: getSpecimensResult?.ok ? getSpecimensResult.data.total : 0,
        isLoading: isGetSessionsPending || isGetSpecimensPending,
    };
}

export function HouseRow({ siteId, label }: { siteId: number; label: string }) {
    const { sessions, specimens, isLoading } = useSiteTotals(siteId);
    const completeness = sessions > 0 ? 100 : 0;

    return (
        <TableRow className="hover:bg-muted/50 cursor-pointer">
            <TableCell className="font-medium">{label}</TableCell>
            <TableCell>{isLoading ? "..." : sessions}</TableCell>
            <TableCell>{isLoading ? "..." : specimens}</TableCell>
            <TableCell><CompletenessBox percentage={completeness} isLoading={isLoading} /></TableCell>
            <TableCell>
                {/* TODO: Add onClick handler for routing */}
                <Button variant="link" className="text-blue-600 p-0 h-auto">View &rarr;</Button>
            </TableCell>
        </TableRow>
    );
}

interface SiteTotals {
    sessions: number;
    specimens: number;
    isLoading: boolean;
}

function SiteTotalsReporter({
    siteId,
    onUpdate,
}: {
    siteId: number;
    onUpdate: (siteId: number, data: SiteTotals) => void;
}) {
    const { sessions, specimens, isLoading } = useSiteTotals(siteId);

    useEffect(() => {
        onUpdate(siteId, { sessions, specimens, isLoading });
    }, [siteId, sessions, specimens, isLoading, onUpdate]);

    return null;
}

export function VillageRow({ siteIds, label }: { siteIds: number[]; label: string }) {
    const [siteTotals, setSiteTotals] = useState<Map<number, SiteTotals>>(new Map());

    const handleUpdate = useCallback((siteId: number, data: SiteTotals) => {
        setSiteTotals(prev => {
            const next = new Map(prev);
            next.set(siteId, data);
            return next;
        });
    }, []);

    let totalSessions = 0;
    let totalSpecimens = 0;
    let completedHouses = 0;
    let isLoading = false;

    for (const siteId of siteIds) {
        const data = siteTotals.get(siteId);
        if (data) {
            totalSessions += data.sessions;
            totalSpecimens += data.specimens;
            if (data.sessions > 0) completedHouses++;
            if (data.isLoading) isLoading = true;
        } else {
            isLoading = true;
        }
    }

    const totalHouses = siteIds.length;
    const completeness = totalHouses > 0 ? Math.round((completedHouses / totalHouses) * 100) : 0;

    return (
        <>
            {siteIds.map(siteId => (
                <SiteTotalsReporter
                    key={siteId}
                    siteId={siteId}
                    onUpdate={handleUpdate}
                />
            ))}
            <TableRow className="hover:bg-muted/50 cursor-pointer">
                <TableCell className="font-medium">{label}</TableCell>
                <TableCell>{isLoading ? `${totalSessions}...` : totalSessions}</TableCell>
                <TableCell>{isLoading ? `${totalSpecimens}...` : totalSpecimens}</TableCell>
                <TableCell><CompletenessBox percentage={completeness} isLoading={isLoading} /></TableCell>
                <TableCell>
                    {/*Add onClick handler for routing */}
                    <Button variant="link" className="text-blue-600 p-0 h-auto">View &rarr;</Button>
                </TableCell>

            </TableRow>
        </>
    );
}
