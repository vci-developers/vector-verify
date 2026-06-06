'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { MapPin } from 'lucide-react';
import Dhis2SyncSiteStatusBadge from './dhis2-sync-site-status-badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { Site } from '@/api/site/validation/site-schema';
import { isLegacySite } from '@/lib/location/location-query';
import { useGetDhis2SyncTasks } from '@/api/dhis2/hooks/use-get-dhis2-sync-tasks';
import { rollUpDhis2SyncStatus } from '../utils/roll-up-dhis2-sync-status';
import {
    isSiteFullyReviewed,
    isSiteFullySubmittedToDhis2,
    type ReviewSiteSessionSummary,
} from '../../utils/review-site-session-summary';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Dhis2SiteRowProps {
    site: Site;
    collectionCycleId: number;
    siteSessionSummary: ReviewSiteSessionSummary;
    isSelected: boolean;
    onToggleSelected: () => void;
}

export default function Dhis2SiteRow({
    site,
    collectionCycleId,
    siteSessionSummary,
    isSelected,
    onToggleSelected,
}: Dhis2SiteRowProps) {
    const {
        data: getDhis2SyncTasksResult,
        isPending: isGetDhis2SyncTasksPending,
    } = useGetDhis2SyncTasks({
        collectionCycleId,
        siteId: site.siteId,
    });

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

    const status = getDhis2SyncTasksResult?.ok
        ? rollUpDhis2SyncStatus(
              isSiteFullyReviewed(siteSessionSummary),
              isSiteFullySubmittedToDhis2(siteSessionSummary),
              getDhis2SyncTasksResult.data.tasks[0],
          )
        : undefined;

    const isSelectionDisabled =
        status === undefined ||
        status === 'queued' ||
        status === 'running' ||
        status === 'reviewPending';

    return (
        <TableRow>
            <TableCell className="w-10">
                {!isSelectionDisabled && (
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
                    {isGetDhis2SyncTasksPending || !getDhis2SyncTasksResult ? (
                        <Skeleton height="md" width="sm" rounded="lg" />
                    ) : status === undefined ? (
                        <Badge
                            variant="outline"
                            className="bg-destructive/20 text-destructive border-destructive/50"
                        >
                            Error determining status
                        </Badge>
                    ) : (
                        <Dhis2SyncSiteStatusBadge status={status} />
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
