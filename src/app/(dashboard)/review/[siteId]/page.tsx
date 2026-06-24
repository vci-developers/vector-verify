import { sessionKeys } from '@/api/session/session-keys';
import { surveillanceFormKeys } from '@/api/surveillance-form/surveillance-form-keys';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import ReviewSiteDetailsPageClient from '@/features/review/site-details/components/review-site-details-page-client';
import { getSurveillanceFormBySessionId } from '@/api/surveillance-form/get-surveillance-form-by-session-id';
import type { GetAllSessionsQueryParams } from '@/api/session/validation/get-all-sessions-schema';
import { getAllSessions } from '@/api/session/get-all-sessions';

interface ReviewSiteDetailPageProps {
    params: Promise<{
        siteId: string;
    }>;
    searchParams: Promise<{
        startDate?: string;
        endDate?: string;
        displayName?: string;
    }>;
}

export default async function ReviewSiteDetailPage({
    params,
    searchParams,
}: ReviewSiteDetailPageProps) {
    const siteId = Number((await params).siteId);
    const { startDate, endDate, displayName } = await searchParams;

    const queryClient = new QueryClient();

    const getAllSessionsQueryParams: GetAllSessionsQueryParams = {
        siteIds: [siteId],
        startDate,
        endDate,
        type: 'SURVEILLANCE',
    };

    const authorizedGetAllSessionsResult = await withAuthSession(
        async accessToken => {
            const getAllSessionsResult = await getAllSessions(
                accessToken,
                getAllSessionsQueryParams,
            );

            queryClient.setQueryData(
                sessionKeys.allSessions(getAllSessionsQueryParams),
                getAllSessionsResult,
            );

            if (getAllSessionsResult.ok) {
                await Promise.all(
                    getAllSessionsResult.data.sessions.map(async session => {
                        const result = await getSurveillanceFormBySessionId(
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

            return getAllSessionsResult;
        },
    );

    if (!authorizedGetAllSessionsResult.ok) {
        if (authorizedGetAllSessionsResult.error.kind === 'unauthorized') {
            redirect('/login');
        }
        if (authorizedGetAllSessionsResult.error.kind === 'forbidden') {
            redirect('/forbidden');
        }
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ReviewSiteDetailsPageClient
                siteId={siteId}
                startDate={startDate}
                endDate={endDate}
                siteName={displayName}
            />
        </HydrationBoundary>
    );
}
