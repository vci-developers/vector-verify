import { Separator } from '@/components/ui/separator';
import AuthShell from '@/features/auth/components/auth-shell';
import EmailVerificationPrompt from '@/features/auth/components/email-verification-prompt';
import LoginForm from '@/features/auth/components/login-form';
import { ACCESS_COOKIE_NAME } from '@/lib/auth-session/cookies';
import { cookies } from 'next/dist/server/request/cookies';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function LoginPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
    const t = await getTranslations('Auth');

    if (!accessToken) {
        return (
            <AuthShell
                title={t('welcomeBack')}
                description={t('signInToContinue')}
                imageSrc="/assets/auth/images/Login.png"
            >
                <LoginForm />
                <Separator className="my-6" />
                <p className="text-muted-foreground text-center text-sm">
                    {t('noAccountQuestion')}{' '}
                    <Link
                        href="/signup"
                        className="text-primary font-medium hover:underline"
                    >
                        {t('createAccountLinkText')}
                    </Link>
                </p>
            </AuthShell>
        );
    } else {
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
}
