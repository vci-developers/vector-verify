'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { MapPin } from 'lucide-react';
import { useExportMonthContext } from './export-month-row';

interface ExportSiteLeafRowsProps {
    sites: Site[];
    getDisplayName: (site: Site) => string;
}

export default function ExportSiteLeafRows({
    sites,
    getDisplayName,
}: ExportSiteLeafRowsProps) {
    const {
        certifiedCountsBySiteId,
        selectedSiteIds,
        onToggleSites,
        isExporting,
        exportStatusBySiteId,
    } = useExportMonthContext();

    const eligibleSites = sites.filter(
        site => (certifiedCountsBySiteId.get(site.siteId) ?? 0) > 0,
    );

    if (eligibleSites.length === 0) return null;

    return (
        <div className="space-y-1">
            {eligibleSites.map(site => {
                const exportStatus = exportStatusBySiteId.get(site.siteId);
                const isChecked = selectedSiteIds.has(site.siteId);
                const isDisabled = isExporting || exportStatus !== undefined;

                return (
                    <div
                        key={site.siteId}
                        className="flex items-center justify-between rounded-md px-3 py-2"
                    >
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isDisabled}
                                onChange={() =>
                                    onToggleSites([site.siteId], !isChecked)
                                }
                                className={cn(
                                    'h-4 w-4',
                                    isDisabled
                                        ? 'cursor-not-allowed opacity-50'
                                        : 'cursor-pointer',
                                )}
                            />
                            <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                                <MapPin className="text-primary h-4 w-4" />
                            </div>
                            <span className="text-sm">
                                {getDisplayName(site)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {exportStatus === 'success' && (
                                <Badge variant="secondary">Submitted</Badge>
                            )}
                            {exportStatus === 'failed' && (
                                <Badge variant="destructive">Failed</Badge>
                            )}
                            {exportStatus === 'skipped' && (
                                <Badge variant="outline">Skipped</Badge>
                            )}
                            {exportStatus === undefined && (
                                <Badge variant="default">Certified</Badge>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
