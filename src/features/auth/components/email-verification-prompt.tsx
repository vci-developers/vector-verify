'use client';

import { usePostSendEmailVerification } from '@/api/auth/hooks/use-post-send-email-verification';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Fragment, useState } from 'react';
import { useTranslations } from 'next-intl';
import LogoutButton from '@/components/auth-session/logout-button';
import { StorageKeys } from '@/lib/storage-keys';
import { useResendCooldown } from '@/features/auth/hooks/use-resend-cooldown';

export default function EmailVerificationPrompt() {
    const [submitted, setSubmitted] = useState(false);
    const [hasError, setHasError] = useState(false);
    const { secondsRemaining, isOnCooldown, startCooldown } = useResendCooldown(
        StorageKeys.auth.verificationEmailSentTimestamp,
    );
    const t = useTranslations('Auth');
    const { mutate: sendEmailVerification, isPending } =
        usePostSendEmailVerification();

    async function sendEmail() {
        setHasError(false);
        startCooldown();

        sendEmailVerification(undefined, {
            onSuccess: data => {
                if (data.ok) setSubmitted(true);
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
