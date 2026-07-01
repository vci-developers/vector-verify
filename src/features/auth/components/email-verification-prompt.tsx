'use client';

import { usePostSendEmailVerification } from '@/api/auth/hooks/use-post-send-email-verification';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Fragment, useState } from 'react';
import { useTranslations } from 'next-intl';
import LogoutButton from '@/components/auth-session/logout-button';

export default function EmailVerificationPrompt() {
    const [submitted, setSubmitted] = useState(false);
    const t = useTranslations('Auth');
    const { mutate: sendEmailVerification, isPending } =
        usePostSendEmailVerification();

    async function sendEmail() {
        sendEmailVerification(undefined, {
            onSuccess: data => {
                if (data.ok) setSubmitted(true);
            },
            onError: () => {
                return (
                    <Fragment>
                        <Separator className="my-6" />
                        <p className="text-muted-foreground text-center text-sm">
                            {t('verificationEmailFailedMessage')}
                        </p>
                        <Button className="w-full" onClick={sendEmail}>
                            {t('verifyEmailButton')}
                        </Button>
                        <Separator className="my-6" />
                        <LogoutButton />
                    </Fragment>
                );
            },
        });
    }

    if (!submitted) {
        return (
            <Fragment>
                <Button
                    className="w-full"
                    onClick={sendEmail}
                    disabled={isPending}
                >
                    {isPending
                        ? t('verificationEmailLoadingMessage')
                        : t('verifyEmailButton')}
                </Button>
                <Separator className="my-6" />
                <LogoutButton />
            </Fragment>
        );
    } else {
        return (
            <Fragment>
                <p className="text-center text-sm">
                    {t('verificationEmailSuccessMessage')}
                </p>
                <Separator className="my-6" />
                <LogoutButton />
            </Fragment>
        );
    }
}
