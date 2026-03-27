'use client';

import { useGetSessions } from '@/api/session/hooks/use-get-sessions';
import { useGetAllSurveillanceForms } from '@/api/surveillance-form/hooks/use-get-all-surveillance-forms';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import ReviewSiteDetailHeader from '@/features/review/components/site-detail/review-site-detail-header';
import SurveillanceFormReviewWorkspace from '@/features/review/components/site-detail/surveillance-form-review/surveillance-form-review-workspace';
import { ClipboardList } from 'lucide-react';

interface SurveillanceFormReviewPageClientProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
}

export default function SurveillanceFormReviewPageClient({
    siteId,
    startDate,
    endDate,
}: SurveillanceFormReviewPageClientProps) {
    const { data: getSessionsResult, isPending: isGetSessionsPending } =
        useGetSessions({ siteId, startDate, endDate });

    const sessions = getSessionsResult?.ok
        ? getSessionsResult.data.sessions
        : [];

    const sessionIds = sessions.map(s => s.sessionId);

    const {
        data: getAllSurveillanceFormsResult,
        isPending: isGetAllSurveillanceFormsPending,
    } = useGetAllSurveillanceForms(
        { sessionIds },
        { enabled: sessionIds.length > 0 },
    );

    if (isGetSessionsPending || !getSessionsResult) {
        return <h1>LOADING...</h1>;
    }

    if (!getSessionsResult.ok) {
        return <h1>ERROR: {getSessionsResult.error.message}</h1>;
    }

    if (isGetAllSurveillanceFormsPending || !getAllSurveillanceFormsResult) {
        return <h1>LOADING...</h1>;
    }

    if (!getAllSurveillanceFormsResult.ok) {
        return (
            <h1>ERROR: {getAllSurveillanceFormsResult.error.message}</h1>
        );
    }

    const formsMap = new Map(
        getAllSurveillanceFormsResult.data.surveillanceForms.map(f => [
            f.sessionId,
            f,
        ]),
    );

    const surveillanceForms = sessions.map(session => ({
        session,
        form: formsMap.get(session.sessionId) ?? null,
    }));

    return (
        <PageShell
            title="Review"
            description={`Review submitted session data by district and month.`}
            icon={ClipboardList}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="p-6">
                    <ReviewSiteDetailHeader currentStep={1} />
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="p-6">
                    <SurveillanceFormReviewWorkspace
                        surveillanceForms={surveillanceForms}
                    />
                </CardContent>
            </Card>
        </PageShell>
    );
}
