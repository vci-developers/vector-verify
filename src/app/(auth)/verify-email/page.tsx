import AuthShell from '@/features/auth/components/auth-shell';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyEmail } from '@/api/auth/verify-email';
import { ACCESS_COOKIE_NAME } from '@/lib/auth-session/cookies';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';

interface VerifyEmailPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
    searchParams,
}: VerifyEmailPageProps) {
    const t = await getTranslations('Auth');
    async function resendVerificationCode() {
        redirect('/login');
    }

    const accessToken = (await cookies()).get(ACCESS_COOKIE_NAME)?.value;
    if (!accessToken) return;

    const { token } = await searchParams;
    if (!token) {
        return (
            <AuthShell
                title={t('verifyYourEmail')}
                description={t('verifyEmailDescription')}
                imageSrc="/assets/auth/images/Login.png"
            >
                <p>{t('missingVerificationToken')}</p>
            </AuthShell>
        );
    } else {
        const response = await verifyEmail(accessToken, {
            token,
        });

        if (!response.ok) {
            console.error(
                'Email Verification Failed: ',
                response.error.message,
            );
            return (
                <AuthShell
                    title="Verify your email"
                    description="Email verification in progress."
                    imageSrc="/assets/auth/images/Login.png"
                >
                    {response.error.message ===
                    'Verification token is required' ? (
                        <>
                            <p className="text-muted-foreground text-center text-sm">
                                {t('invalidVerificationLink')}
                            </p>
                            <Button onClick={resendVerificationCode}>
                                {t('resendVerificationEmailButton')}
                            </Button>
                        </>
                    ) : response.error.message ===
                      'Invalid or expired verification token' ? (
                        <>
                            <p className="text-muted-foreground text-center text-sm">
                                {t('invalidOrExpiredVerificationLink')}
                            </p>
                            <Button onClick={resendVerificationCode}>
                                {t('resendVerificationEmailButton')}
                            </Button>
                        </>
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
