import AuthShell from '@/features/auth/components/auth-shell';
import { redirect } from 'next/navigation';
import { postVerify } from '@/api/user/post-verify';
import { getUserProfile } from '@/api/user/get-user-profile';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import { Fragment } from 'react/jsx-runtime';
import LogoutButton from '@/components/auth-session/logout-button';

const TOKEN_MISMATCH_ERROR_MESSAGE =
    'Verification token does not match the authenticated user';

interface VerifyEmailPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
    searchParams,
}: VerifyEmailPageProps) {
    const t = await getTranslations('Auth');

    const getUserProfileResult = await withAuthSession(getUserProfile);
    if (
        getUserProfileResult.ok &&
        getUserProfileResult.data.user.emailVerified
    ) {
        redirect('/');
    }

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
                    <Button asChild className="w-full">
                        <Link href="/email-verification">
                            {t('resendVerificationEmailButton')}
                        </Link>
                    </Button>
                    <LogoutButton />
                </div>
            </AuthShell>
        );
    } else {
        const response = await withAuthSession(accessToken =>
            postVerify(accessToken, {
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
                        TOKEN_MISMATCH_ERROR_MESSAGE ? (
                            <Fragment>
                                <p className="text-muted-foreground text-center text-sm">
                                    {t('accountVerificationTokenMismatch')}
                                </p>
                                <LogoutButton />
                            </Fragment>
                        ) : (
                            <Fragment>
                                <p className="text-muted-foreground text-center text-sm">
                                    {response.error.message ??
                                        t('somethingWentWrong')}
                                </p>
                                <Button asChild className="w-full">
                                    <Link href="/email-verification">
                                        {t('resendVerificationEmailButton')}
                                    </Link>
                                </Button>
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
