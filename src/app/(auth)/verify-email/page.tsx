import AuthShell from '@/features/auth/components/auth-shell';
import { redirect } from 'next/navigation';
import { postVerifyEmail } from '@/api/auth/post-verify-email';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { Fragment } from 'react/jsx-runtime';
import LogoutButton from '@/components/auth-session/logout-button';

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
                <div className="flex flex-col items-center gap-4">
                    <p className="text-muted-foreground text-center text-sm">
                        {t('missingVerificationToken')}
                    </p>
                    <LogoutButton />
                </div>
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
                    title={t('verifyYourEmail')}
                    description={t('verifyEmailIssueDescription')}
                    imageSrc="/assets/auth/images/Login.png"
                >
                    <Separator className="my-6" />
                    <div className="flex flex-col items-center gap-4">
                        {response.error.message ===
                        'Verification token is required' ? (
                            <Fragment>
                                <p className="text-muted-foreground text-center text-sm">
                                    {t('invalidVerificationLink')}
                                </p>
                                <Button className="w-full">
                                    <Link href="/email-verification">
                                        {t('resendVerificationEmailButton')}
                                    </Link>
                                </Button>
                                <LogoutButton />
                            </Fragment>
                        ) : response.error.message ===
                          'Invalid or expired verification token' ? (
                            <Fragment>
                                <p className="text-muted-foreground text-center text-sm">
                                    {t('invalidOrExpiredVerificationLink')}
                                </p>
                                <Button className="w-full">
                                    <Link href="/email-verification">
                                        {t('resendVerificationEmailButton')}
                                    </Link>
                                </Button>
                                <LogoutButton />
                            </Fragment>
                        ) : response.error.message ===
                          'Verification token does not match the authenticated user' ? (
                            <Fragment>
                                <p className="text-muted-foreground text-center text-sm">
                                    {t('accountVerificationTokenMismatch')}
                                </p>
                                <LogoutButton />
                            </Fragment>
                        ) : (
                            <Fragment>
                                <p className="text-muted-foreground text-center text-sm">
                                    response.error.message
                                </p>
                                <LogoutButton />
                            </Fragment>
                        )}
                    </div>
                </AuthShell>
            );
        } else {
            redirect('/');
        }
    }
}
