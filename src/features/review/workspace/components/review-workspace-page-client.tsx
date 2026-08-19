'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { GetAllSessionsQueryParams } from '@/api/session/validation/get-all-sessions-schema';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import PageShell from '@/components/layout/page-shell';
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
import { useState } from 'react';
import ReviewWorkspaceHeader from './layout/review-workspace-header';
import ImageReviewWorkspace from '../image/components/image-review-workspace';
import CertificationWorkspace from '../certification/components/certification-workspace';
import ErrorBanner from '@/components/ui/error-banner';

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
                <ErrorBanner
                    message={
                        getAllSessionsResult.error.message ??
                        t('currentFormError')
                    }
                />
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
                        ) : currentStepIndex === 1 ? (
                            <ImageReviewWorkspace
                                site={site!}
                                sessions={sessions}
                                startDate={startDate}
                                endDate={endDate}
                                collectionCycleId={collectionCycleId}
                                timezone={timezone}
                                onGoToPreviousStep={goToPreviousStep}
                                onGoToNextStep={goToNextStep}
                            />
                        ) : (
                            <CertificationWorkspace
                                sessions={sessions}
                                readOnly={readOnly}
                                timezone={timezone}
                                onGoToPreviousStep={goToPreviousStep}
                            />
                        )}
                    </CardContent>
                </Card>
            )}
        </PageShell>
    );
}
