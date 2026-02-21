import { getUserProfile } from '@/api/user/get-user-profile';
import type { UserProfile } from '@/api/user/validation/user-profile-schema';
import { ACCESS_COOKIE_NAME } from '@/features/auth_new/lib/cookies';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Fragment } from 'react/jsx-runtime';

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

    return <Fragment>{children}</Fragment>;
}
