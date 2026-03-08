'use client';

import type { Site } from "@/api/site/validation/site-schema";
import { usePagination } from "@/lib/hooks/use-pagination";
import { useEffect, useMemo } from "react";
import type { ViewValue } from "./operations-tasks-details-header";
import OperationsDetailPagination from "./operations-details-pagination";
import { HouseRow, VillageRow } from "./operations-details-list-data";

import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessibleSites, activeView]);

    const houseItems = useMemo(() => {
        return accessibleSites
            .filter(site => site.houseNumber?.trim())
            .sort((a, b) => (a.houseNumber ?? '').localeCompare(b.houseNumber ?? ''));
    }, [accessibleSites]);

    const villageItems = useMemo(() => {
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
        return [...map.entries()]
            .map(([name, siteIds]) => ({ name, siteIds }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [accessibleSites]);

    const items = activeView === "village" ? villageItems : houseItems;
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
                    <TableHeader className="bg-muted">
                        <TableRow>
                            <TableHead>
                                {activeView === "house" ? "House Number" : "Village Name"}
                            </TableHead>
                            <TableHead>Total Sessions</TableHead>
                            <TableHead>Total Specimens</TableHead>
                            <TableHead>Completeness</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activeView === "house" ? (
                            (paginatedItems as Site[]).map((site) => (
                                <HouseRow
                                    key={site.siteId}
                                    siteId={site.siteId}
                                    label={site.houseNumber ?? ''}
                                />
                            ))
                        ) : (
                            (paginatedItems as { name: string; siteIds: number[] }[]).map((village) => (
                                <VillageRow
                                    key={village.name}
                                    siteIds={village.siteIds}
                                    label={village.name}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            )}

            {totalPages > 1 && (
                <>
                    <div className="border-border/50 border-t" />
                    <OperationsDetailPagination
                        page={page}
                        totalPages={totalPages}
                        pageRange={createPageRange(totalPages)}
                        onPageChange={newPage => goToPage(newPage, totalPages)}
                        onPrevious={() => previousPage(totalPages)}
                        onNext={() => nextPage(totalPages)}
                    />
                </>
            )}
        </div>
    );
}
