'use client';

import type { VerificationEmailSuccessPayload } from '@/api/auth/validation/send-verification-email-schema';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function EmailVerificationPrompt() {
    const [submitted, setSubmitted] = useState(false);
    const router = useRouter();
    const t = useTranslations('Auth');

    async function sendEmail() {
        const response = await fetch('/api/auth/verification-email', {
            method: 'POST',
            credentials: 'include',
        });

        const sendEmailResult: Result<
            VerificationEmailSuccessPayload,
            NetworkError
        > = await response.json();

        if (!response.ok || !sendEmailResult.ok) {
            console.error(
                'Sending Verification Email Failed: ',
                response.statusText,
            );
            switch (response.status) {
                case 400:
                    router.replace('/');
                    router.refresh();
                    return;
                case 401:
                    router.replace('/login');
                    router.refresh();
                    return;
                default:
                    return (
                        <>
                            <p className="text-muted-foreground text-center text-sm">
                                {t('verificationEmailFailedMessage')}
                            </p>
                            <Button className="w-full" onClick={sendEmail}>
                                {t('verifyEmailButton')}
                            </Button>
                        </>
                    );
            }
        } else {
            setSubmitted(true);
        }
    }

    if (!submitted) {
        return (
            <Button className="w-full" onClick={sendEmail}>
                {t('verifyEmailButton')}
            </Button>
        );
    } else {
        return (
            <>
                <Separator className="my-6" />
                <p className="text-muted-foreground text-center text-sm">
                    {t('verificationEmailSuccessMessage')}
                </p>
            </>
        );
    }
}
