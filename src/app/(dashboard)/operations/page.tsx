import { getUserPermissions } from '@/api/user/get-user-permissions';
import { userKeys } from '@/api/user/user-keys';
import type { GetUserPermissionsResponseBody } from '@/api/user/validation/get-user-permissions-schema';
import OperationsPageClient from '@/features/operations/components/page-client/operations-page-client';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';

export default async function OperationsPage() {
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
            <OperationsPageClient />
        </HydrationBoundary>
    );
}
