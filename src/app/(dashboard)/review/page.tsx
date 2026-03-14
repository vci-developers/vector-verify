import { getUserPermissions } from '@/api/user/get-user-permissions';
import type { GetUserPermissionsResponseBody } from '@/api/user/validation/get-user-permissions-schema';
import { userKeys } from '@/api/user/user-keys';
import ReviewSiteListPageClient from '@/features/review/components/site-list/page-client/review-site-list-page-client';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';

export default async function ReviewSiteListPage() {
    const queryClient = new QueryClient();

    const authorizedGetUserPermissionsResult =
        await withAuthSession<GetUserPermissionsResponseBody>(
            async accessToken => {
                const getUserPermissionsResult =
                    await getUserPermissions(accessToken);
                queryClient.setQueryData(
                    userKeys.permissions(),
                    getUserPermissionsResult,
                );
                return getUserPermissionsResult;
            },
        );

    if (!authorizedGetUserPermissionsResult.ok) {
        if (authorizedGetUserPermissionsResult.error.kind === 'unauthorized') {
            redirect('/login');
        }
        if (authorizedGetUserPermissionsResult.error.kind === 'forbidden') {
            return <h1>FORBIDDEN</h1>;
        }
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ReviewSiteListPageClient />
        </HydrationBoundary>
    );
}
