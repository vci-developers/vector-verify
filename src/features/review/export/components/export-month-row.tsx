'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { createContext, useContext, useState } from 'react';
import { isMonthFullySelected } from '@/features/review/export/utils/export-selection-helpers';
import type { ExportSiteStatus } from '@/api/dhis2/validation/dhis2-sync-schema';
import ExportSiteHierarchy from './export-site-hierarchy';

interface ExportMonthState {
    certifiedCountsBySiteId: Map<number, number>;
    selectedSiteIds: Set<number>;
    onToggleSites: (siteIds: number[], select: boolean) => void;
    isExporting: boolean;
    exportStatusBySiteId: Map<number, ExportSiteStatus>;
}

const ExportMonthContext = createContext<ExportMonthState | null>(null);

export function useExportMonthContext() {
    const exportMonthState = useContext(ExportMonthContext);
    if (!exportMonthState)
        throw new Error(
            'useExportMonthContext must be used within ExportMonthRow',
        );
    return exportMonthState;
}

interface ExportMonthRowProps {
    month: Date;
    certifiedCountsBySiteId: Map<number, number>;
    certifiedSiteIds: Set<number>;
    monthSelectedSiteIds: Set<number>;
    onToggleSites: (siteIds: number[], select: boolean) => void;
    exportStatusBySiteId: Map<number, ExportSiteStatus>;
    sites: Site[];
    isExporting: boolean;
}

export default function ExportMonthRow({
    month,
    certifiedCountsBySiteId,
    certifiedSiteIds,
    monthSelectedSiteIds,
    onToggleSites,
    exportStatusBySiteId,
    sites,
    isExporting,
}: ExportMonthRowProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedSitePaths, setExpandedSitePaths] = useState<Set<string>>(
        new Set(),
    );

    function togglePath(path: string, descendantPaths: string[]) {
        setExpandedSitePaths(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
                descendantPaths.forEach(p => next.add(p));
            }
            return next;
        });
    }

    const monthKey = format(month, 'yyyy-MM');
    const monthCertifiedCount = certifiedSiteIds.size;
    const monthSelectedCount = [...certifiedSiteIds].filter(id =>
        monthSelectedSiteIds.has(id),
    ).length;
    const isMonthChecked = isMonthFullySelected(
        certifiedSiteIds,
        monthSelectedSiteIds,
    );

    return (
        <ExportMonthContext.Provider
            value={{
                certifiedCountsBySiteId,
                selectedSiteIds: monthSelectedSiteIds,
                onToggleSites,
                isExporting,
                exportStatusBySiteId,
            }}
        >
            <Collapsible
                open={!isCollapsed}
                onOpenChange={() => setIsCollapsed(prev => !prev)}
            >
                <CollapsibleTrigger className="group flex w-full items-center gap-2 py-3">
                    <input
                        type="checkbox"
                        checked={isMonthChecked}
                        disabled={monthCertifiedCount === 0 || isExporting}
                        onChange={() =>
                            onToggleSites(
                                [...certifiedSiteIds],
                                !isMonthChecked,
                            )
                        }
                        onClick={event => event.stopPropagation()}
                        className="h-4 w-4 cursor-pointer"
                    />
                    <ChevronRight className="text-muted-foreground h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                    <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                        {format(month, 'MMMM yyyy')}
                    </span>
                    {monthCertifiedCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                            {monthSelectedCount} / {monthCertifiedCount}{' '}
                            certified
                        </Badge>
                    )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <ExportSiteHierarchy
                        sites={sites}
                        parentPath={monthKey}
                        expandedSitePaths={expandedSitePaths}
                        onTogglePath={togglePath}
                    />
                </CollapsibleContent>
            </Collapsible>
        </ExportMonthContext.Provider>
    );
}
