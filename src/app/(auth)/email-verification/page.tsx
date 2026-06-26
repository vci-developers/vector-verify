import AuthShell from '@/features/auth/components/auth-shell';
import EmailVerificationPrompt from '@/features/auth/components/email-verification-prompt';
import { getTranslations } from 'next-intl/server';

export default async function EmailVerificationPage() {
    const t = await getTranslations('Auth');

    return (
        <AuthShell
            title={t('verifyYourEmail')}
            description={t('emailVerificationPromptDescription')}
            imageSrc="/assets/auth/images/Login.png"
        >
            <EmailVerificationPrompt />
        </AuthShell>
    );
}
