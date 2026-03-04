'use client';

import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import type { UserPermissions } from '@/api/user/validation/user-permissions-schema';
import { Button } from '@/components/ui/button';
import { networkErrorMessage } from '@/lib/network/network-error';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';

export default function DashboardPage() {
    const router = useRouter();

    const {
        data: getUserPermissionsResult,
        isPending: isGetUserPermissionsPending,
    } = useGetUserPermissions();
    if (isGetUserPermissionsPending || !getUserPermissionsResult) {
        return <h1>LOADING...</h1>;
    }

    if (!getUserPermissionsResult.ok) {
        // SHOW TOAST MESSAGE
        return (
            <h1>
                ERROR: {networkErrorMessage(getUserPermissionsResult.error)}
            </h1>
        );
    }

    const userPermissions: UserPermissions =
        getUserPermissionsResult.data.permissions;

    return (
        <Fragment>
            {userPermissions.sites.viewSiteMetadata && (
                <Button onClick={() => router.push('/review')}>
                    Review
                </Button>
            )}
            {userPermissions.annotations.viewAndWriteAnnotationTasks && (
                <Button onClick={() => router.push('/annotate')}>
                    Annotate
                </Button>
            )}
        </Fragment>
    );
}
