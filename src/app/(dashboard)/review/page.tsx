import { getUserPermissions } from '@/api/user/get-user-permissions';
import type { GetUserPermissionsResponseBody } from '@/api/user/validation/get-user-permissions-schema';
import { userKeys } from '@/api/user/user-keys';
import ReviewSitesListPageClient from '@/features/review/components/sites-list/page-client/review-sites-list-page-client';
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
            redirect('/forbidden');
        }
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ReviewSitesListPageClient />
        </HydrationBoundary>
    );
}
