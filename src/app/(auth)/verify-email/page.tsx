import AuthShell from '@/features/auth/components/auth-shell';
import { redirect } from 'next/navigation';
import { postVerifyEmail } from '@/api/auth/post-verify-email';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { Fragment } from 'react/jsx-runtime';

interface VerifyEmailPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
    searchParams,
}: VerifyEmailPageProps) {
    const t = await getTranslations('Auth');

    const { token } = await searchParams;
    if (!token) {
        return (
            <AuthShell
                title={t('verifyYourEmail')}
                description={t('verifyEmailDescription')}
                imageSrc="/assets/auth/images/Login.png"
            >
                <Separator className="my-6" />
                <p>{t('missingVerificationToken')}</p>
            </AuthShell>
        );
    } else {
        const response = await withAuthSession(accessToken =>
            postVerifyEmail(accessToken, {
                token,
            }),
        );

        if (!response.ok) {
            return (
                <AuthShell
                    title="Verify your email"
                    description="Email verification in progress."
                    imageSrc="/assets/auth/images/Login.png"
                >
                    <Separator className="my-6" />
                    {response.error.message ===
                    'Verification token is required' ? (
                        <Fragment>
                            <p className="text-muted-foreground text-center text-sm">
                                {t('invalidVerificationLink')}
                            </p>
                            <Button asChild>
                                <Link href="/email-verification">
                                    {t('resendVerificationEmailButton')}
                                </Link>
                            </Button>
                        </Fragment>
                    ) : response.error.message ===
                      'Invalid or expired verification token' ? (
                        <Fragment>
                            <p className="text-muted-foreground text-center text-sm">
                                {t('invalidOrExpiredVerificationLink')}
                            </p>
                            <Button asChild>
                                <Link href="/email-verification">
                                    {t('resendVerificationEmailButton')}
                                </Link>
                            </Button>
                        </Fragment>
                    ) : response.error.message ===
                      'Verification token does not match the authenticated user' ? (
                        <p className="text-muted-foreground text-center text-sm">
                            {t('accountVerificationTokenMismatch')}
                        </p>
                    ) : (
                        <p className="text-muted-foreground text-center text-sm">
                            response.error.message
                        </p>
                    )}
                </AuthShell>
            );
        } else {
            redirect('/');
        }
    }
}
