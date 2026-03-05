import { getUserProfile } from '@/api/user/get-user-profile';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { redirect } from 'next/navigation';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { err, ok, type Result } from '@/lib/result/result';
import type { GetUserProfileResponseBody } from '@/api/user/validation/get-user-profile-schema';
import {
    networkErrorMessage,
    type NetworkError,
} from '@/lib/network/network-error';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const authorizedGetUserProfileResult =
        await withAuthSession<GetUserProfileResponseBody>(async accessToken => {
            const getUserProfileResult: Result<
                GetUserProfileResponseBody,
                NetworkError
            > = await getUserProfile(accessToken);

            if (!getUserProfileResult.ok) {
                return err(getUserProfileResult.error);
            }

            const userProfile = getUserProfileResult.data.user;
            if (!userProfile.isWhitelisted) {
                return err({
                    kind: 'forbidden',
                    status: 403,
                    message: 'User is not whitelisted',
                });
            }

            return ok(getUserProfileResult.data);
        });

    if (!authorizedGetUserProfileResult.ok) {
        if (authorizedGetUserProfileResult.error.kind === 'unauthorized') {
            redirect('/login');
        }
        if (authorizedGetUserProfileResult.error.kind === 'forbidden') {
            redirect('/forbidden');
        }
        return (
            <h1>
                ERROR:{' '}
                {networkErrorMessage(authorizedGetUserProfileResult.error)}
            </h1>
        );
    }

    const authorizedUserProfile = authorizedGetUserProfileResult.data.user;

    return (
        <SidebarProvider>
            <AppSidebar userProfile={authorizedUserProfile} />
            <SidebarInset className="flex min-h-screen flex-col">
                <main className="flex-1 p-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
