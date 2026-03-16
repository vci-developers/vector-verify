import { getUserPermissions } from '@/api/user/get-user-permissions';
import type { GetUserPermissionsResponseBody } from '@/api/user/validation/get-user-permissions-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    networkErrorMessage,
    type NetworkError,
} from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { redirect } from 'next/navigation';
import { Fragment } from 'react';

interface AnnotateLayoutProps {
    children: React.ReactNode;
}

export default async function AnnotateLayout({
    children,
}: AnnotateLayoutProps) {
    const authorizedGetUserPermissionsResult =
        await withAuthSession<GetUserPermissionsResponseBody>(
            async accessToken => {
                const getUserPermissionsResult: Result<
                    GetUserPermissionsResponseBody,
                    NetworkError
                > = await getUserPermissions(accessToken);
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
        return (
            <h1>
                Error:{' '}
                {networkErrorMessage(authorizedGetUserPermissionsResult.error)}
            </h1>
        );
    }

    const userPermissions = authorizedGetUserPermissionsResult.data.permissions;
    if (!userPermissions.annotations.viewAndWriteAnnotationTasks) {
        redirect('/forbidden');
    }

    return <Fragment>{children}</Fragment>;
}
