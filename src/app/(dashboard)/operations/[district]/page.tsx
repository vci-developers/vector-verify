import { getUserPermissions } from '@/api/user/get-user-permissions';
import { userKeys } from '@/api/user/user-keys';
import type { GetUserPermissionsResponseBody } from '@/api/user/validation/get-user-permissions-schema';
import OperationsSiteListPageClient from '@/features/operations/components/site-list/page-client/operations-site-list-page-client';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';

interface OperationsLocationPageProps {
    params: Promise<{ district: string }>;
}

export default async function OperationsLocationPage({
    params,
}: OperationsLocationPageProps) {
    const queryClient = new QueryClient();
    const location = decodeURIComponent((await params).district);

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
            <OperationsSiteListPageClient initialDistrict={location} />
        </HydrationBoundary>
    );
}
