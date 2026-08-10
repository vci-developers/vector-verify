'use client';

import { usePostSendVerification } from '@/api/user/hooks/use-post-send-verification';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Fragment, useState } from 'react';
import { useTranslations } from 'next-intl';
import LogoutButton from '@/components/auth-session/logout-button';
import { useResendCooldown } from '@/lib/hooks/use-resend-cooldown';

export default function EmailVerificationPageClient() {
    const [submitted, setSubmitted] = useState(false);
    const [hasError, setHasError] = useState(false);
    const { secondsRemaining, isOnCooldown, startCooldown } =
        useResendCooldown();
    const t = useTranslations('Auth');
    const { mutate: sendVerification, isPending } = usePostSendVerification();

    async function sendEmail() {
        setHasError(false);

        sendVerification(undefined, {
            onSuccess: data => {
                if (data.ok) {
                    setSubmitted(true);
                    startCooldown();
                } else {
                    setHasError(true);
                }
            },
            onError: () => {
                setHasError(true);
            },
        });
    }

    return (
        <Fragment>
            {hasError && (
                <p className="text-muted-foreground p-2 text-center text-sm">
                    {t('verificationEmailFailedMessage')}
                </p>
            )}
            {submitted && (
                <p className="text-muted-foreground p-2 text-center text-sm">
                    {t('verificationEmailSuccessMessage')}
                </p>
            )}
            <Button
                className="w-full"
                onClick={sendEmail}
                disabled={isPending || isOnCooldown}
            >
                {isPending
                    ? t('verificationEmailLoadingMessage')
                    : isOnCooldown
                      ? t('verificationEmailCooldownMessage', {
                            time: secondsRemaining,
                        })
                      : hasError || submitted
                        ? t('verificationEmailResendMessage')
                        : t('verifyEmailButton')}
            </Button>
            <Separator className="my-6" />
            <LogoutButton />
        </Fragment>
    );
}
