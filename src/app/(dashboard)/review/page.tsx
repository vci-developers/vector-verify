import { getUserPermissions } from '@/api/user/get-user-permissions';
import type { GetUserPermissionsResponseBody } from '@/api/user/validation/get-user-permissions-schema';
import { userKeys } from '@/api/user/user-keys';
import ReviewHouseListPageClient from '@/features/review/components/house-list/review-house-list-page-client';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';

export default async function ReviewPage() {
    const queryClient = new QueryClient();

    const authorizedResult =
        await withAuthSession<GetUserPermissionsResponseBody>(
            async accessToken => {
                const permissionsResult =
                    await getUserPermissions(accessToken);
                queryClient.setQueryData(
                    userKeys.permissions(),
                    permissionsResult,
                );
                return permissionsResult;
            },
        );

    if (!authorizedResult.ok) {
        if (authorizedResult.error.kind === 'unauthorized') {
            redirect('/login');
        }
        if (authorizedResult.error.kind === 'forbidden') {
            return <h1>FORBIDDEN</h1>;
        }
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ReviewHouseListPageClient />
        </HydrationBoundary>
    );
}
