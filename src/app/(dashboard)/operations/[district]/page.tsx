'use client';

import { useParams } from 'next/navigation';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import type { UserPermissions } from '@/api/user/validation/user-permissions-schema';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import ReviewTasksListPageClient from '@/features/operations/components/details-list/operations-tasks-list-page-client-';

export default function ReviewPage() {
    const queryClient = new QueryClient();
    const params = useParams<{ district: string }>();
    const district = decodeURIComponent(params.district);

    const {
        data: getUserPermissionsResult,
        isPending: isGetUserPermissionsPending,
    } = useGetUserPermissions();

    if (isGetUserPermissionsPending || !getUserPermissionsResult) {
        return <h1>LOADING...</h1>;
    }

    if (!getUserPermissionsResult.ok) {
        return <h1>ERROR: {getUserPermissionsResult.error.message}</h1>;
    }

    const userPermissions: UserPermissions =
        getUserPermissionsResult.data.permissions;
    const accessibleSites = userPermissions.sites.canAccessSites.filter(
        site => site.district?.toLowerCase() === district.toLowerCase()
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ReviewTasksListPageClient accessibleSites={accessibleSites} />
        </HydrationBoundary>
    );
}