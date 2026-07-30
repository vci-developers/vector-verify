import AuthShell from '@/features/auth/components/auth-shell';
import EmailVerificationPageClient from '@/features/auth/components/email-verification-page-client';
import { getTranslations } from 'next-intl/server';

export default async function EmailVerificationPage() {
    const t = await getTranslations('Auth');

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
