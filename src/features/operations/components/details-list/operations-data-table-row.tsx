'use client';

import { useCallback, useEffect, useState } from "react";
import { useGetSessions } from "@/api/session/hooks/use-get-sessions";
import { useGetSpecimens } from "@/api/specimen/hooks/use-get-specimens";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CompletenessBox } from "@/components/ui/completeness-box";

export function HouseRow({ siteId, label }: { siteId: number; label: string }) {
    const {
        data: getSessionsResult,
        isPending: isGetSessionsPending,
    } = useGetSessions({ siteId });

    const {
        data: getSpecimensResult,
        isPending: isGetSpecimensPending,
    } = useGetSpecimens({ siteId });

    const sessions = getSessionsResult?.ok ? getSessionsResult.data.total : 0;
    const specimens = getSpecimensResult?.ok ? getSpecimensResult.data.total : 0;
    const isPending = isGetSessionsPending || isGetSpecimensPending;
    const completeness = sessions > 0 ? 100 : 0;

    return (
        <TableRow className="hover:bg-muted/50 cursor-pointer">
            <TableCell className="font-medium">{label}</TableCell>
            <TableCell>{isPending ? "..." : sessions}</TableCell>
            <TableCell>{isPending ? "..." : specimens}</TableCell>
            <TableCell><CompletenessBox percentage={completeness} isLoading={isPending} /></TableCell>
            <TableCell>
                {/* TODO: Add onClick handler for routing */}
                <Button variant="link" className="text-blue-600 p-0 h-auto">View &rarr;</Button>
            </TableCell>
        </TableRow>
    );
}

function SiteTotalsReporter({
    siteId,
    onUpdate,
}: {
    siteId: number;
    onUpdate: (siteId: number, sessions: number, specimens: number, isPending: boolean) => void;
}) {
    const {
        data: getSessionsResult,
        isPending: isGetSessionsPending,
    } = useGetSessions({ siteId });

    const {
        data: getSpecimensResult,
        isPending: isGetSpecimensPending,
    } = useGetSpecimens({ siteId });

    const sessions = getSessionsResult?.ok ? getSessionsResult.data.total : 0;
    const specimens = getSpecimensResult?.ok ? getSpecimensResult.data.total : 0;
    const isPending = isGetSessionsPending || isGetSpecimensPending;

    useEffect(() => {
        onUpdate(siteId, sessions, specimens, isPending);
    }, [siteId, sessions, specimens, isPending, onUpdate]);

    return null;
}

export function VillageRow({ siteIds, label }: { siteIds: number[]; label: string }) {
    const [totalsMap, setTotalsMap] = useState<Map<number, { sessions: number; specimens: number; isPending: boolean }>>(new Map());

    const handleUpdate = useCallback((
        siteId: number, 
        sessions: number, 
        specimens: number, 
        isPending: boolean) => {
        setTotalsMap(prev => {
            const next = new Map(prev);
            next.set(siteId, { sessions, specimens, isPending });
            return next;
        });
    }, []);

    let totalSessions = 0;
    let totalSpecimens = 0;
    let completedHouses = 0;
    let isLoading = false;

    for (const siteId of siteIds) {
        const data = totalsMap.get(siteId);
        if (data) {
            totalSessions += data.sessions;
            totalSpecimens += data.specimens;
            if (data.sessions > 0) completedHouses++;
            if (data.isPending) isLoading = true;
        } else {
            isLoading = true;
        }
    }

    const completeness = siteIds.length > 0 ? Math.round((completedHouses / siteIds.length) * 100) : 0;

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
                    <Button variant="link" className="text-blue-600 p-0 h-auto">View &rarr;</Button>
                </TableCell>
            </TableRow>
        </>
    );
}
