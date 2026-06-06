'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { MapPin } from 'lucide-react';
import Dhis2SyncSiteStatusBadge from './dhis2-sync-site-status-badge';
import type { Dhis2SyncSiteStatus } from '../utils/dhis2-sync-site-status';
import { Checkbox } from '@/components/ui/checkbox';
import type { Site } from '@/api/site/validation/site-schema';
import { isLegacySite } from '@/lib/location/location-query';

interface Dhis2SiteRowProps {
    site: Site;
    status: Dhis2SyncSiteStatus;
    isSelected: boolean;
    onToggleSelected: () => void;
}

export default function Dhis2SiteRow({
    site,
    status,
    isSelected,
    onToggleSelected,
}: Dhis2SiteRowProps) {
    let primaryLabel: string;
    let ancestorLabels: string[];
    if (isLegacySite(site)) {
        const parts = [
            site.district,
            site.subCounty,
            site.healthCenter,
            site.parish,
            site.villageName,
            site.houseNumber,
        ].filter((value): value is string => Boolean(value));
        primaryLabel = parts.at(-1) ?? site.name ?? `Site ${site.siteId}`;
        ancestorLabels = parts.slice(0, -1);
    } else {
        primaryLabel = site.name ?? `Site ${site.siteId}`;
        ancestorLabels = Object.values(site.locationHierarchy).filter(
            value => value !== site.name,
        );
    }

    const isInFlight = status === 'queued' || status === 'running';

    return (
        <TableRow>
            <TableCell className="w-10">
                {!isInFlight && (
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={onToggleSelected}
                        aria-label={`Select ${primaryLabel}`}
                    />
                )}
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full">
                        <MapPin className="h-4 w-4" />
                    </div>
                    <span className="text-foreground text-sm font-medium">
                        {primaryLabel}
                    </span>
                    {ancestorLabels.length > 0 && (
                        <span className="text-muted-foreground text-xs">
                            {ancestorLabels.join(' · ')}
                        </span>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end">
                    <Dhis2SyncSiteStatusBadge status={status} />
                </div>
            </TableCell>
        </TableRow>
    );
}
