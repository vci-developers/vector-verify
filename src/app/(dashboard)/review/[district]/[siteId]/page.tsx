import { sessionKeys } from '@/api/session/session-keys';
import { getSessions } from '@/api/session/get-sessions';
import type { GetSessionsQueryParams } from '@/api/session/validation/get-sessions-schema';
import { getAllSurveillanceForms } from '@/api/surveillance-form/get-all-surveillance-forms';
import { surveillanceFormKeys } from '@/api/surveillance-form/surveillance-form-keys';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import ReviewDetailsPageClient from '@/features/review/components/site-detail/page-client/review-details-page-client';

interface ReviewSiteDetailPageProps {
    params: Promise<{
        siteId: string;
    }>;
    searchParams: Promise<{
        startDate?: string;
        endDate?: string;
    }>;
}

export default async function ReviewSiteDetailPage({
    params,
    searchParams,
}: ReviewSiteDetailPageProps) {
    const { siteId: siteIdParam } = await params;
    const { startDate, endDate } = await searchParams;
    const siteId = Number(siteIdParam);
    const queryClient = new QueryClient();

    const getSessionsQueryParams: GetSessionsQueryParams = {
        siteId,
        startDate,
        endDate,
    };

    const authorizedGetSessionsResult = await withAuthSession(
        async accessToken => {
            const getSessionsResult = await getSessions(
                accessToken,
                getSessionsQueryParams,
            );

            queryClient.setQueryData(
                sessionKeys.sessions(getSessionsQueryParams),
                getSessionsResult,
            );

            if (getSessionsResult.ok) {
                const sessionIds = getSessionsResult.data.sessions.map(
                    session => session.sessionId,
                );
                if (sessionIds.length > 0) {
                    const getAllSurveillanceFormsResult =
                        await getAllSurveillanceForms(accessToken, {
                            sessionId: sessionIds,
                        });
                    queryClient.setQueryData(
                        surveillanceFormKeys.allSurveillanceForms({
                            sessionId: sessionIds,
                        }),
                        getAllSurveillanceFormsResult,
                    );
                }
            }

            return getSessionsResult;
        },
    );

    if (!authorizedGetSessionsResult.ok) {
        if (authorizedGetSessionsResult.error.kind === 'unauthorized') {
            redirect('/login');
        }
        if (authorizedGetSessionsResult.error.kind === 'forbidden') {
            redirect('/forbidden');
        }
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense>
                <ReviewDetailsPageClient
                    siteId={siteId}
                    startDate={startDate}
                    endDate={endDate}
                />
            </Suspense>
        </HydrationBoundary>
    );
}
