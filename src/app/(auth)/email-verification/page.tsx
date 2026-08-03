import AuthShell from '@/features/auth/components/auth-shell';
import EmailVerificationPageClient from '@/features/auth/components/email-verification-page-client';
import { getTranslations } from 'next-intl/server';
import { getUserProfile } from '@/api/user/get-user-profile';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { redirect } from 'next/navigation';

export default async function EmailVerificationPage() {
    const t = await getTranslations('Auth');

    const getUserProfileResult = await withAuthSession(getUserProfile);
    if (
        getUserProfileResult.ok &&
        getUserProfileResult.data.user.emailVerified
    ) {
        redirect('/');
    }

    return (
        <AuthShell
            title={t('verifyYourEmail')}
            description={t('emailVerificationPromptDescription')}
            imageSrc="/assets/auth/images/Login.png"
        >
            <EmailVerificationPageClient />
        </AuthShell>
    );
}
