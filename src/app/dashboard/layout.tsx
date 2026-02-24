import { getUserProfile } from '@/api/user/get-user-profile';
import type { UserProfile } from '@/api/user/validation/user-profile-schema';
import AppSidebar from '@/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ACCESS_COOKIE_NAME } from '@/features/auth_new/lib/cookies';
import { logout } from '@/features/auth_new/server-actions/logout';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default async function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const accessToken = (await cookies()).get(ACCESS_COOKIE_NAME)?.value;
    if (!accessToken) {
        // SHOW TOAST MESSAGE
        redirect('/login_new');
    }

    const userProfileResult = await getUserProfile(accessToken);

    if (!userProfileResult.ok) {
        // SHOW TOAST MESSAGE
        return <h1>ERROR: {userProfileResult.error.message}</h1>;
    }

    const userProfile: UserProfile = userProfileResult.data.user;

    if (!userProfile.isWhitelisted) {
        return <h1>NOT WHITELISTED</h1>;
    }

    return (
        <SidebarProvider>
            <AppSidebar userProfile={userProfile} onLogout={logout} />
            <SidebarInset className="flex min-h-screen flex-col">
                <main className="flex-1 p-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
