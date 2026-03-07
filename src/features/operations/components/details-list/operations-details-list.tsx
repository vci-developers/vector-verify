'use client';

import type { Site } from "@/api/site/validation/site-schema";
import { usePagination } from "@/lib/hooks/use-pagination";
import { Fragment, useEffect, useMemo } from "react";
import type { ViewValue } from "./operations-tasks-details-header";
import OperationsDetailPagination from "./operations-details-pagination";
import { useQueries } from "@tanstack/react-query";
import { sessionKeys } from "@/api/session/session-keys";
import { fetchSessions } from "@/api/session/hooks/use-get-sessions";
import { specimenKeys } from "@/api/specimen/specimen-keys";
import { fetchSpecimens } from "@/api/specimen/hooks/use-get-specimens";

import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
} from "@/components/ui/table";

interface OperationsDetailsListProps {
    accessibleSites: Site[];
    activeView: ViewValue;
}


export default function OperationsDetailsList({
    accessibleSites,
    activeView,
}: OperationsDetailsListProps) {
    const {
        page,
        limit,
        goToPage,
        nextPage,
        previousPage,
        resetPage,
        createPageRange,
    } = usePagination();

    useEffect(() => {
        resetPage();
    }, [accessibleSites, activeView]);

    const items = useMemo(() => {
        if (activeView === "village") {
            return [
                ...new Set(
                    accessibleSites
                        .map(site => site.villageName?.trim())
                        .filter((village): village is string => Boolean(village)),
                ),
            ].sort();
        } else if (activeView === "house") {
            return [
                ...new Set(
                    accessibleSites
                        .map(site => site.houseNumber?.trim())
                        .filter((house): house is string => Boolean(house)),
                ),
            ].sort();
        }
        return [];
    }, [accessibleSites, activeView]);

    const siteIdsByVillage = useMemo(() => {
        const map = new Map<string, number[]>();
        for (const site of accessibleSites) {
            const village = site.villageName?.trim();
            if (!village) continue;
            const existing = map.get(village);
            if (existing) {
                existing.push(site.siteId);
            } else {
                map.set(village, [site.siteId]);
            }
        }
        return map;
    }, [accessibleSites]);

    const uniqueSiteIds = useMemo(
        () => [...new Set(accessibleSites.map(s => s.siteId))],
        [accessibleSites]
    );

    const sessionQueries = useQueries({
        queries: uniqueSiteIds.map(siteId => ({
            queryKey: sessionKeys.sessions({ siteId }),
            queryFn: () => fetchSessions({ siteId }),
        })),
    });

    const specimenQueries = useQueries({
        queries: uniqueSiteIds.map(siteId => ({
            queryKey: specimenKeys.specimens({ siteId }),
            queryFn: () => fetchSpecimens({ siteId }),
        })),
    });

    const sessionCountBySiteId = useMemo(() => {
        const map = new Map<number, number>();
        sessionQueries.forEach((q, i) => {
            const siteId = uniqueSiteIds[i];
            if (siteId !== undefined && q.data?.ok) {
                map.set(siteId, q.data.data.total);
            }
        });
        return map;
    }, [sessionQueries, uniqueSiteIds]);

    const specimenCountBySiteId = useMemo(() => {
        const map = new Map<number, number>();
        specimenQueries.forEach((q, i) => {
            const siteId = uniqueSiteIds[i];
            if (siteId !== undefined && q.data?.ok) {
                map.set(siteId, q.data.data.total);
            }
        });
        return map;
    }, [specimenQueries, uniqueSiteIds]);

    const isLoading = sessionQueries.some(q => q.isPending) || specimenQueries.some(q => q.isPending);

    const getTotalsForSiteIds = (siteIds: number[]) => {
        let totalSessions = 0;
        let totalSpecimens = 0;
        for (const siteId of siteIds) {
            totalSessions += sessionCountBySiteId.get(siteId) ?? 0;
            totalSpecimens += specimenCountBySiteId.get(siteId) ?? 0;
        }
        return { totalSessions, totalSpecimens };
    };

    const totalPages = Math.max(1, Math.ceil(items.length / limit));
    const paginatedItems = items.slice((page - 1) * limit, page * limit);

    if (!activeView) {
        return (
            <p className="text-muted-foreground text-center py-8">
                Please select a location type to view
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {paginatedItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                    No {activeView === "village" ? "villages" : "houses"} found
                </p>
            ) : (
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>
                                {activeView === "house" ? "House Number" : "Village Name"}
                            </TableHead>
                            <TableHead>Total Sessions</TableHead>
                            <TableHead>Total Specimens</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedItems.map((item, index) => {
                            if (activeView === "village") {
                                const siteIds = siteIdsByVillage.get(item) ?? [];
                                const { totalSessions, totalSpecimens } = getTotalsForSiteIds(siteIds);
                                return (
                                    <TableRow key={`${item}-${index}`} className="hover:bg-muted/50 cursor-pointer">
                                        <TableCell className="font-medium">{item}</TableCell>
                                        <TableCell>{isLoading ? "—" : totalSessions}</TableCell>
                                        <TableCell>{isLoading ? "—" : totalSpecimens}</TableCell>
                                    </TableRow>
                                );
                            }
                            const site = accessibleSites.find(s => s.houseNumber?.trim() === item)!;
                            const { totalSessions, totalSpecimens } = getTotalsForSiteIds([site.siteId]);
                            return (
                                <TableRow key={`${item}-${index}`} className="hover:bg-muted/50 cursor-pointer">
                                    <TableCell className="font-medium">{item}</TableCell>
                                    <TableCell>{isLoading ? "—" : totalSessions}</TableCell>
                                    <TableCell>{isLoading ? "—" : totalSpecimens}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}

            {totalPages > 1 && (
                <Fragment>
                    <div className="border-border/50 border-t" />
                    <OperationsDetailPagination
                        page={page}
                        totalPages={totalPages}
                        totalItems={items.length}
                        pageRange={createPageRange(totalPages)}
                        onPageChange={newPage => goToPage(newPage, totalPages)}
                        onPrevious={() => previousPage(totalPages)}
                        onNext={() => nextPage(totalPages)}
                    />
                </Fragment>
            )}
        </div>
    );
}