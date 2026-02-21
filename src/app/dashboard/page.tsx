'use client';

import { useUserPermissions } from '@/api/user/hooks/use-user-permissions';
import type { UserPermissions } from '@/api/user/validation/user-permissions-schema';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';

export default function DashboardPage() {
    const router = useRouter();

    const { data: userPermissionsResult, isPending: isUserPermissionsPending } =
        useUserPermissions();
    if (isUserPermissionsPending || !userPermissionsResult) {
        return <h1>LOADING...</h1>;
    }

    if (!userPermissionsResult.ok) {
        // SHOW TOAST MESSAGE
        return <h1>ERROR: {userPermissionsResult.error.message}</h1>;
    }

    const userPermissions: UserPermissions = userPermissionsResult.data.permissions;

    return (
        <Fragment>
            {userPermissions.sites.viewSiteMetadata && (
                <Button onClick={() => router.push('/review_new')}>
                    Review
                </Button>
            )}
            {userPermissions.annotations.viewAndWriteAnnotationTasks && (
                <Button onClick={() => router.push('/annotate_new')}>
                    Annotate
                </Button>
            )}
        </Fragment>
    );
}
