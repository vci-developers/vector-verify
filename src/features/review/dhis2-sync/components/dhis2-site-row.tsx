'use client';

import { TableCell, TableRow } from '@/components/ui/table';
import { MapPin } from 'lucide-react';
import Dhis2SyncSiteStatusBadge from './dhis2-sync-site-status-badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { Site } from '@/api/site/validation/site-schema';
import { useGetDhis2SyncTasks } from '@/api/dhis2/hooks/use-get-dhis2-sync-tasks';
import { rollUpDhis2SyncStatus } from '../utils/roll-up-dhis2-sync-status';
import {
    isSiteFullySubmittedToDhis2,
    type ReviewSiteSessionSummary,
} from '../../utils/review-site-session-summary';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { Dhis2SyncSiteStatus } from '../utils/dhis2-sync-site-status';
import { usePostDhis2SyncTask } from '@/api/dhis2/hooks/use-post-dhis2-sync-task';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { getSiteLabelParts } from '../utils/get-site-label-parts';
import Dhis2IrsDialog from './dhis2-irs-dialog';
import type { SiteIrsData } from '@/api/dhis2/validation/post-dhis2-sync-task-schema';
import { useQueryClient } from '@tanstack/react-query';
import { sessionKeys } from '@/api/session/session-keys';
import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';

const POLL_INTERVAL_MS = 4000;

function getSubmitButtonLabel(status: Dhis2SyncSiteStatus): string {
    switch (status) {
        case 'submitted':
        case 'hasNewCertifiedData':
            return 'Re-submit';
        case 'failed':
        case 'timedOut':
        case 'skipped':
            return 'Retry';
        default:
            return 'Submit';
    }
}

function getSubmitBlockReason(
    status: Dhis2SyncSiteStatus,
    siteHasUnassignedSessions: boolean,
): string | undefined {
    if (siteHasUnassignedSessions)
        return "Resolve this site's unassigned sessions in Review first.";
    if (status === 'queued' || status === 'running')
        return 'A submission is already in progress.';
    return undefined;
}

interface Dhis2SiteRowProps {
    site: Site;
    collectionCycle: CollectionCycle;
    siteSessionSummary: ReviewSiteSessionSummary;
    siteHasUnassignedSessions: boolean;
    isSelected: boolean;
    onToggleSelected: () => void;
}

export default function Dhis2SiteRow({
    site,
    collectionCycle,
    siteSessionSummary,
    siteHasUnassignedSessions,
    isSelected,
    onToggleSelected,
}: Dhis2SiteRowProps) {
    const [isSiteIrsDialogOpen, setIsSiteIrsDialogOpen] = useState(false);
    const dialogSubmissions = useMemo(
        () => [{ site, collectionCycle }],
        [site, collectionCycle],
    );

    const queryClient = useQueryClient();
    const {
        data: getDhis2SyncTasksResult,
        isPending: isGetDhis2SyncTasksPending,
    } = useGetDhis2SyncTasks(
        {
            collectionCycleId: collectionCycle.id,
            siteId: site.siteId,
        },
        {
            refetchInterval: query => {
                const polledGetDhis2SyncTasksResult = query.state.data;
                if (!polledGetDhis2SyncTasksResult?.ok) return false;
                const polledDhis2SyncTasksStatus = rollUpDhis2SyncStatus(
                    isSiteFullySubmittedToDhis2(siteSessionSummary),
                    polledGetDhis2SyncTasksResult.data.tasks[0],
                );
                return polledDhis2SyncTasksStatus === 'queued' ||
                    polledDhis2SyncTasksStatus === 'running'
                    ? POLL_INTERVAL_MS
                    : false;
            },
        },
    );

    const {
        mutate: createDhis2SyncTask,
        isPending: isCreateDhis2SyncTaskPending,
    } = usePostDhis2SyncTask();

    const { primaryLabel, ancestorLabels } = getSiteLabelParts(site);

    const latestTask = getDhis2SyncTasksResult?.ok
        ? getDhis2SyncTasksResult.data.tasks[0]
        : undefined;

    const status = getDhis2SyncTasksResult?.ok
        ? rollUpDhis2SyncStatus(
              isSiteFullySubmittedToDhis2(siteSessionSummary),
              latestTask,
          )
        : undefined;

    const statusReasonMessage =
        status === 'skipped' || status === 'failed'
            ? latestTask?.result?.results?.[0]?.message
            : undefined;

    const previousTaskStatusRef = useRef(latestTask?.status);
    useEffect(() => {
        const previousTaskStatus = previousTaskStatusRef.current;
        const currentTaskStatus = latestTask?.status;
        previousTaskStatusRef.current = currentTaskStatus;

        const wasInFlight =
            previousTaskStatus === 'pending' ||
            previousTaskStatus === 'running';

        if (wasInFlight && currentTaskStatus === 'completed') {
            queryClient.invalidateQueries({ queryKey: sessionKeys.root });
        }
    }, [latestTask?.status, queryClient]);

    const isSelectionDisabled =
        status === undefined ||
        status === 'queued' ||
        status === 'running' ||
        status === 'submitted' ||
        siteHasUnassignedSessions;

    const submitBlockReason =
        status !== undefined
            ? getSubmitBlockReason(status, siteHasUnassignedSessions)
            : undefined;

    function handleSubmit(irsData: SiteIrsData[]) {
        createDhis2SyncTask({
            queryParams: {
                collectionCycleId: collectionCycle.id,
                siteId: site.siteId,
            },
            requestBody: { irsData },
        });
    }

    return (
        <Fragment>
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
                <TableCell className="w-full max-w-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                            <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex min-w-0 flex-col">
                            <span className="text-foreground truncate text-sm font-medium">
                                {primaryLabel}
                            </span>
                            {ancestorLabels.length > 0 && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="text-muted-foreground truncate text-xs">
                                            {ancestorLabels.join(' ≫ ')}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-md text-wrap">
                                        {ancestorLabels.join(' ≫ ')}
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                    <div className="flex justify-end">
                        {isGetDhis2SyncTasksPending ||
                        !getDhis2SyncTasksResult ? (
                            <Skeleton height="md" width="sm" rounded="lg" />
                        ) : status === undefined ? (
                            <Badge
                                variant="outline"
                                className="bg-destructive/20 text-destructive border-destructive/50"
                            >
                                Error determining status
                            </Badge>
                        ) : statusReasonMessage ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Dhis2SyncSiteStatusBadge
                                            status={status}
                                        />
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-h-64 max-w-md overflow-y-auto text-wrap whitespace-pre-line">
                                    {statusReasonMessage}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Dhis2SyncSiteStatusBadge status={status} />
                        )}
                    </div>
                </TableCell>
                <TableCell className="w-28 text-right">
                    {status !== undefined &&
                        (submitBlockReason ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            disabled
                                        >
                                            {getSubmitButtonLabel(status)}
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {submitBlockReason}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Button
                                size="xs"
                                variant="outline"
                                disabled={isCreateDhis2SyncTaskPending}
                                onClick={() => setIsSiteIrsDialogOpen(true)}
                            >
                                {isCreateDhis2SyncTaskPending && (
                                    <Spinner className="size-3" />
                                )}
                                {getSubmitButtonLabel(status)}
                            </Button>
                        ))}
                </TableCell>
            </TableRow>
            <Dhis2IrsDialog
                open={isSiteIrsDialogOpen}
                onOpenChange={setIsSiteIrsDialogOpen}
                submissions={dialogSubmissions}
                onConfirmSubmission={handleSubmit}
            />
        </Fragment>
    );
}
