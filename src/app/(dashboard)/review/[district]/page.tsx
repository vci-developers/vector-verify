import { getSessions } from '@/api/session/get-sessions';
import { sessionKeys } from '@/api/session/session-keys';
import type {
    GetSessionsQueryParams,
    GetSessionsResponseBody,
} from '@/api/session/validation/get-sessions-schema';
import { getUserPermissions } from '@/api/user/get-user-permissions';
import { userKeys } from '@/api/user/user-keys';
import ReviewHouseListPageClient from '@/features/review/components/house-list/review-house-list-page-client';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';

interface ReviewDistrictPageProps {
    params: Promise<{
        district: string;
    }>;
}

export default async function ReviewDistrictPage({
    params,
}: ReviewDistrictPageProps) {
    const { district: encodedDistrict } = await params;
    const district = decodeURIComponent(encodedDistrict);

    const queryClient = new QueryClient();

    const getSessionsQueryParams: GetSessionsQueryParams = {
        district,
        limit: 100,
    };

    const authorizedResult = await withAuthSession<GetSessionsResponseBody>(
        async accessToken => {
            const [sessionsResult, permissionsResult] = await Promise.all([
                getSessions(accessToken, getSessionsQueryParams),
                getUserPermissions(accessToken),
            ]);

            queryClient.setQueryData(
                sessionKeys.sessions(getSessionsQueryParams),
                sessionsResult,
            );
            queryClient.setQueryData(
                userKeys.permissions(),
                permissionsResult,
            );

            return sessionsResult;
        },
    );

    if (!authorizedResult.ok) {
        if (authorizedResult.error.kind === 'unauthorized') {
            redirect('/login');
        }
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ReviewHouseListPageClient district={district} />
        </HydrationBoundary>
    );
}
