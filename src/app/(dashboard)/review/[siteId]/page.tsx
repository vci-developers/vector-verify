import { sessionKeys } from '@/api/session/session-keys';
import { getSessions } from '@/api/session/get-sessions';
import type { GetSessionsQueryParams } from '@/api/session/validation/get-sessions-schema';
import { getSurveillanceFormDataBySessionId } from '@/api/surveillance-form/get-surveillance-form-data-by-session-id';
import { surveillanceFormKeys } from '@/api/surveillance-form/surveillance-form-keys';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';
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
                await Promise.all(
                    getSessionsResult.data.sessions.map(async session => {
                        const result = await getSurveillanceFormDataBySessionId(
                            accessToken,
                            session.sessionId,
                        );
                        queryClient.setQueryData(
                            surveillanceFormKeys.surveillanceFormBySessionId(
                                session.sessionId,
                            ),
                            result,
                        );
                    }),
                );
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
            <ReviewDetailsPageClient
                siteId={siteId}
                startDate={startDate}
                endDate={endDate}
            />
        </HydrationBoundary>
    );
}
