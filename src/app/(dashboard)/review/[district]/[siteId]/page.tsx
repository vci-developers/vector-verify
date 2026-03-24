import { getSessions } from '@/api/session/get-sessions';
import type { GetSessionsResponseBody } from '@/api/session/validation/get-sessions-schema';
import { sessionKeys } from '@/api/session/session-keys';
import ReviewSitePageClient from '@/features/review/components/site-review/review-site-page-client';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';

interface ReviewSitePageProps {
    params: Promise<{
        district: string;
        siteId: string;
    }>;
    searchParams: Promise<{
        startDate?: string;
        endDate?: string;
    }>;
}

export default async function ReviewSitePage({
    params,
    searchParams,
}: ReviewSitePageProps) {
    const siteId = Number((await params).siteId);
    const { startDate, endDate } = await searchParams;

    const queryClient = new QueryClient();
    const queryParams = {
        siteId,
        startDate,
        endDate,
    };

    const authorizedGetSessionsResult =
        await withAuthSession<GetSessionsResponseBody>(async accessToken => {
            const result = await getSessions(accessToken, queryParams);
            queryClient.setQueryData(sessionKeys.sessions(queryParams), result);
            return result;
        });

    if (!authorizedGetSessionsResult.ok) {
        if (authorizedGetSessionsResult.error.kind === 'unauthorized') {
            redirect('/login');
        }
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ReviewSitePageClient
                siteId={siteId}
                startDate={startDate ?? ''}
                endDate={endDate ?? ''}
            />
        </HydrationBoundary>
    );
}
