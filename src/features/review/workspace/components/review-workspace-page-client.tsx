'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { GetAllSessionsQueryParams } from '@/api/session/validation/get-all-sessions-schema';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { accumulateSessionSummary } from '@/features/review/utils/accumulate-session-summary';
import {
    emptySessionSummary,
    isSiteFullyReviewed,
} from '@/features/review/utils/review-site-session-summary';
import MetadataReviewWorkspace from '@/features/review/workspace/metadata/components/metadata-review-workspace';
import { isLegacySite } from '@/lib/location/location-query';
import { ClipboardList, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';
import ReviewWorkspaceHeader from './layout/review-workspace-header';

const REVIEW_STEP_LABEL_KEYS = [
    'metadataStep',
    'imageStep',
    'certificationStep',
] as const;

interface ReviewWorkspacePageClientProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
    collectionCycleId?: number;
    timezone?: string;
}

export default function ReviewWorkspacePageClient({
    siteId,
    startDate,
    endDate,
    collectionCycleId,
    timezone,
}: ReviewWorkspacePageClientProps) {
    const t = useTranslations('ReviewWorkspace');
    const tCommon = useTranslations('Common');
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const sessionQueryParams: GetAllSessionsQueryParams =
        collectionCycleId !== undefined
            ? { siteIds: [siteId], collectionCycleId, type: 'SURVEILLANCE' }
            : { siteIds: [siteId], startDate, endDate, type: 'SURVEILLANCE' };

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions(sessionQueryParams);

    const { data: getUserPermissionsResult } = useGetUserPermissions();
    const accessibleSites = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.permissions.sites.canAccessSites
        : [];
    const programId = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.programId
        : undefined;
    const site = accessibleSites.find(
        accessibleSite => accessibleSite.siteId === siteId,
    );
    const siteName = site
        ? ((isLegacySite(site) ? site.houseNumber : site.name) ?? undefined)
        : undefined;

    const sessions = getAllSessionsResult?.ok
        ? getAllSessionsResult.data.sessions
        : [];
    const sessionSummary = sessions.reduce(
        (summary, session) => accumulateSessionSummary(summary, session),
        emptySessionSummary(),
    );
    const readOnly = isSiteFullyReviewed(sessionSummary);

    const stepLabels = REVIEW_STEP_LABEL_KEYS.map(key => t(key));
    const currentStepLabel = stepLabels[currentStepIndex]!;

    function goToPreviousStep() {
        setCurrentStepIndex(index => Math.max(index - 1, 0));
    }

    function goToNextStep() {
        setCurrentStepIndex(index =>
            Math.min(index + 1, REVIEW_STEP_LABEL_KEYS.length - 1),
        );
    }

    return (
        <PageShell
            title="Review"
            description="Review submitted session data by location"
            icon={ClipboardList}
        >
            {isGetAllSessionsPending || !getAllSessionsResult ? (
                <SkeletonList count={4} height="xl" width="full" />
            ) : !getAllSessionsResult.ok ? (
                <p className="text-destructive text-sm">
                    {getAllSessionsResult.error.message}
                </p>
            ) : (
                <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                    <CardContent className="space-y-6 p-6">
                        <ReviewWorkspaceHeader
                            stepLabels={stepLabels}
                            currentStepIndex={currentStepIndex}
                            siteName={siteName}
                        />

                        <Separator />

                        {readOnly && (
                            <div className="bg-muted/60 text-muted-foreground flex items-center gap-2 rounded-md p-4 text-sm">
                                <Lock className="h-4 w-4 shrink-0" />
                                {t('readOnlyNotice')}
                            </div>
                        )}

                        {currentStepIndex === 0 ? (
                            programId === undefined ? (
                                <SkeletonList
                                    count={6}
                                    height="lg"
                                    width="full"
                                />
                            ) : (
                                <MetadataReviewWorkspace
                                    sessions={sessions}
                                    programId={programId}
                                    timezone={timezone}
                                    readOnly={readOnly}
                                    onGoToNextStep={goToNextStep}
                                />
                            )
                        ) : (
                            <Fragment>
                                {/* Placeholder step body — Steps 12–13 replace
                                    each slot with its real workspace and own
                                    nav, retiring this temporary footer. */}
                                <div className="text-muted-foreground py-12 text-center text-sm">
                                    {t('stepComingSoon', {
                                        step: currentStepLabel,
                                    })}
                                </div>

                                <div className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={goToPreviousStep}
                                    >
                                        {tCommon('previous')}
                                    </Button>
                                    <Button
                                        onClick={goToNextStep}
                                        disabled={
                                            currentStepIndex ===
                                            REVIEW_STEP_LABEL_KEYS.length - 1
                                        }
                                    >
                                        {tCommon('next')}
                                    </Button>
                                </div>
                            </Fragment>
                        )}
                    </CardContent>
                </Card>
            )}
        </PageShell>
    );
}
