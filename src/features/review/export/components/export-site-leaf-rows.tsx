'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin } from 'lucide-react';
import type { Dhis2ExportSiteStatus } from '@/api/dhis2/validation/dhis2-sync-schema';

interface ExportSiteLeafRowsProps {
    sites: Site[];
    getDisplayName: (site: Site) => string;
    certifiedCountsBySiteId: Map<number, number>;
    selectedSiteIds: Set<number>;
    onToggleSites: (siteIds: number[], select: boolean) => void;
    isExporting: boolean;
    exportStatusBySiteId: Map<number, Dhis2ExportSiteStatus>;
}

export default function ExportSiteLeafRows({
    sites,
    getDisplayName,
    certifiedCountsBySiteId,
    selectedSiteIds,
    onToggleSites,
    isExporting,
    exportStatusBySiteId,
}: ExportSiteLeafRowsProps) {
    const certifiedSites = sites.filter(
        site => (certifiedCountsBySiteId.get(site.siteId) ?? 0) > 0,
    );

    if (certifiedSites.length === 0) return null;

    return (
        <div className="space-y-1">
            {certifiedSites.map(site => {
                const exportStatus = exportStatusBySiteId.get(site.siteId);
                const isChecked = selectedSiteIds.has(site.siteId);
                const isDisabled = isExporting || exportStatus !== undefined;

                return (
                    <div
                        key={site.siteId}
                        className="flex items-center justify-between rounded-md px-3 py-2"
                    >
                        <div className="flex items-center gap-3">
                            <Checkbox
                                checked={isChecked}
                                disabled={isDisabled}
                                onCheckedChange={() =>
                                    onToggleSites([site.siteId], !isChecked)
                                }
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
                                <Badge variant="secondary">
                                    Submitted to DHIS2
                                </Badge>
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
