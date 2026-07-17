'use client';

import { usePostSendEmailVerification } from '@/api/auth/hooks/use-post-send-email-verification';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Fragment, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import LogoutButton from '@/components/auth-session/logout-button';
import { StorageKeys } from '@/lib/storage-keys';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';

const RESEND_COOLDOWN_SECONDS = 60;

export default function EmailVerificationPrompt() {
    const [submitted, setSubmitted] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(0);
    const [emailSentTimestamp, setEmailSentTimestamp] = useLocalStorage<number>(
        StorageKeys.auth.emailSentTimestamp,
        0,
    );
    const t = useTranslations('Auth');
    const { mutate: sendEmailVerification, isPending } =
        usePostSendEmailVerification();

    useEffect(() => {
        function updateRemaining() {
            if (!emailSentTimestamp) {
                setSecondsRemaining(0);
                return;
            }
            const elapsedSeconds = (Date.now() - emailSentTimestamp) / 1000;
            const remainingTime = Math.ceil(
                RESEND_COOLDOWN_SECONDS - elapsedSeconds,
            );
            setSecondsRemaining(remainingTime > 0 ? remainingTime : 0);
        }

        updateRemaining();
        const intervalId = setInterval(updateRemaining, 1000);
        return () => clearInterval(intervalId);
    }, [emailSentTimestamp]);

    const isOnCooldown = secondsRemaining > 0;

    async function sendEmail() {
        setHasError(false);
        setEmailSentTimestamp(Date.now());

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
