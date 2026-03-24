import { getSessions } from '@/api/session/get-sessions';
import type { GetSessionsResponseBody } from '@/api/session/validation/get-sessions-schema';
import { sessionKeys } from '@/api/session/session-keys';
import ReviewHousePageClient from '@/features/review/components/house-review/review-house-page-client';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';

interface ReviewHousePageProps {
    params: Promise<{
        district: string;
        siteId: string;
    }>;
    searchParams: Promise<{
        startDate?: string;
        endDate?: string;
    }>;
}

export default async function ReviewHousePage({
    params,
    searchParams,
}: ReviewHousePageProps) {
    const { district, siteId: siteIdParam } = await params;
    const { startDate, endDate } = await searchParams;

    const siteId = Number(siteIdParam);

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
            <ReviewHousePageClient
                siteId={siteId}
                district={decodeURIComponent(district)}
                startDate={startDate ?? ''}
                endDate={endDate ?? ''}
            />
        </HydrationBoundary>
    );
}
