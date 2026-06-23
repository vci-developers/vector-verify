import { Separator } from '@/components/ui/separator';
import AuthShell from '@/features/auth/components/auth-shell';
import EmailVerificationPrompt from '@/features/auth/components/email-verification-prompt';
import SignupForm from '@/features/auth/components/signup-form';
import { ACCESS_COOKIE_NAME } from '@/lib/auth-session/cookies';
import { cookies } from 'next/dist/server/request/cookies';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function SignupPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
    const t = await getTranslations('Auth');

    if (!accessToken) {
        return (
            <AuthShell
                title="Create your account"
                description="Set up access to your VectorVerify workspace."
                imageSrc="/assets/auth/images/Signup.png"
            >
                <SignupForm />
                <Separator className="my-6" />
                <p className="text-muted-foreground text-center text-sm">
                    {t('existingAccountQuestion')}{' '}
                    <Link
                        href="/login"
                        className="text-primary font-medium hover:underline"
                    >
                        {t('loginLinkText')}
                    </Link>
                </p>
            </AuthShell>
        );
    } else {
        return (
            <AuthShell
                title={t('verifyYourEmail')}
                description={'emailVerificationPromptDescription'}
                imageSrc="/assets/auth/images/Login.png"
            >
                <EmailVerificationPrompt />
            </AuthShell>
        );
    }
}
