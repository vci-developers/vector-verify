'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Site } from '@/api/site/validation/site-schema';
import type { SpecimenClassificationAxis } from '@/api/specimen/validation/specimen-schema';
import { useGetSessionSpecimensCount } from '@/api/specimen/hooks/use-get-session-specimens-count';
import ErrorBanner from '@/components/ui/error-banner';
import { Skeleton } from '@/components/ui/skeleton';
import { buildReviewUnitHref } from '@/lib/review/build-review-unit-href';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import CompositionBreakdown from '@/features/operations/specimen-composition/components/composition-breakdown';
import { buildSpecimenChartConfig } from '@/features/operations/specimen-composition/utils/specimen-composition-helpers';
import ReportingSegmentLabel from '@/features/operations/field-user-compliance/components/reporting-segment-label';
import { sumSessionSpecimenCountsByClass } from '@/features/operations/field-user-compliance/utils/collector-sheet-helpers';
import type { ReportingSegment } from '@/features/operations/field-user-compliance/utils/reporting-segment-helpers';
import type { SiteCollector } from '@/features/operations/field-user-compliance/utils/site-collector-helpers';

const SPECIMEN_CLASSIFICATION_AXES: SpecimenClassificationAxis[] = [
    'species',
    'sex',
    'abdomenStatus',
];

interface CollectorSheetContentProps {
    site: Site;
    collector: SiteCollector;
    segments: ReportingSegment[];
}

export default function CollectorSheetContent({
    site,
    collector,
    segments,
}: CollectorSheetContentProps) {
    const t = useTranslations('OperationsFieldTeamPerformance');
    const {
        data: getSessionSpecimensCountResult,
        isPending: isGetSessionSpecimensCountPending,
    } = useGetSessionSpecimensCount({
        programId: site.programId,
        siteIds: [site.siteId],
        sessionType: 'SURVEILLANCE',
    });

    if (isGetSessionSpecimensCountPending) {
        return <Skeleton className="m-4 h-96" />;
    }

    if (!getSessionSpecimensCountResult?.ok) {
        return (
            <div className="p-4">
                <ErrorBanner message={t('collectorSheetError')} />
            </div>
        );
    }

    const collectorSessionIds = new Set(
        collector.sessionsBySegment.flat().map(session => session.sessionId),
    );
    const collectorSessionSpecimenCounts =
        getSessionSpecimensCountResult.data.sessions.filter(
            sessionSpecimenCount =>
                collectorSessionIds.has(sessionSpecimenCount.sessionId),
        );
    const specimenCountBySessionId = new Map(
        collectorSessionSpecimenCounts.map(sessionSpecimenCount => [
            sessionSpecimenCount.sessionId,
            sessionSpecimenCount.specimenCount,
        ]),
    );
    const totalSpecimenCount = collectorSessionSpecimenCounts.reduce(
        (total, sessionSpecimenCount) =>
            total + sessionSpecimenCount.specimenCount,
        0,
    );

    return (
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
            <div className="flex gap-6 text-sm">
                <p className="text-muted-foreground">
                    <span className="text-foreground block text-xl font-semibold tabular-nums">
                        {collectorSessionIds.size}
                    </span>
                    {t('sessions')}
                </p>
                <p className="text-muted-foreground">
                    <span className="text-foreground block text-xl font-semibold tabular-nums">
                        {totalSpecimenCount}
                    </span>
                    {t('specimens')}
                </p>
            </div>
            <section className="space-y-3">
                <h3 className="text-sm font-semibold">{t('reported')}</h3>
                <div className="grid items-start gap-6 sm:grid-cols-2">
                    {SPECIMEN_CLASSIFICATION_AXES.map(
                        specimenClassificationAxis => {
                            const specimenCountsByClass =
                                sumSessionSpecimenCountsByClass(
                                    specimenClassificationAxis,
                                    collectorSessionSpecimenCounts,
                                );
                            return (
                                <CompositionBreakdown
                                    key={specimenClassificationAxis}
                                    heading={t('classificationAxis', {
                                        axis: specimenClassificationAxis,
                                    })}
                                    specimenCountsByClass={
                                        specimenCountsByClass
                                    }
                                    totalSpecimenCount={totalSpecimenCount}
                                    specimenChartConfig={buildSpecimenChartConfig(
                                        specimenClassificationAxis,
                                        specimenCountsByClass.map(
                                            ({ specimenClass }) =>
                                                specimenClass,
                                        ),
                                    )}
                                    className="min-w-0"
                                />
                            );
                        },
                    )}
                </div>
            </section>
            <section className="space-y-3">
                <h3 className="text-sm font-semibold">{t('sessions')}</h3>
                <div className="overflow-hidden rounded-md border">
                    {segments
                        .map((segment, segmentIndex) => {
                            const segmentSessions = collector.sessionsBySegment[
                                segmentIndex
                            ]!.toSorted(
                                (firstSession, secondSession) =>
                                    secondSession.collectionDate -
                                    firstSession.collectionDate,
                            );
                            if (segmentSessions.length === 0) return null;
                            return (
                                <Fragment key={segment.key}>
                                    <p className="bg-muted text-muted-foreground border-b px-3 py-1.5 text-xs font-medium tracking-wide uppercase">
                                        <ReportingSegmentLabel
                                            segment={segment}
                                        />
                                    </p>
                                    {segmentSessions.map(session => (
                                        <Link
                                            key={session.sessionId}
                                            href={buildReviewUnitHref(session, {
                                                timezone:
                                                    segment.timezone ??
                                                    undefined,
                                            })}
                                            className="hover:bg-muted/50 flex items-center gap-3 border-b px-3 py-2.5 text-sm last:border-b-0"
                                        >
                                            <span className="flex-1">
                                                {formatDateInTimezone(
                                                    session.collectionDate,
                                                    segment.timezone,
                                                    'MMM d, yyyy',
                                                )}
                                            </span>
                                            <span className="text-muted-foreground tabular-nums">
                                                {t('specimenCount', {
                                                    count:
                                                        specimenCountBySessionId.get(
                                                            session.sessionId,
                                                        ) ?? 0,
                                                })}
                                            </span>
                                            <span className="text-primary text-xs">
                                                {t('openInReview')}
                                            </span>
                                        </Link>
                                    ))}
                                </Fragment>
                            );
                        })
                        .toReversed()}
                </div>
            </section>
        </div>
    );
}
