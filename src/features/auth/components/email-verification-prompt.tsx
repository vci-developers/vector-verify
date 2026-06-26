'use client';

import { UsePostSendVerificationEmail } from '@/api/auth/hooks/use-post-send-email-verification';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function EmailVerificationPrompt() {
    const [submitted, setSubmitted] = useState(false);
    const router = useRouter();
    const t = useTranslations('Auth');

    async function sendEmail() {
        const result = await UsePostSendVerificationEmail();

        if (!result.ok) {
            return (
                <Fragment>
                    <Separator className="my-6" />
                    <p className="text-muted-foreground text-center text-sm">
                        {t('verificationEmailFailedMessage')}
                    </p>
                    <Button className="w-full" onClick={sendEmail}>
                        {t('verifyEmailButton')}
                    </Button>
                </Fragment>
            );
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
            <Fragment>
                <Separator className="my-6" />
                <p className="text-muted-foreground text-center text-sm">
                    {t('verificationEmailSuccessMessage')}
                </p>
            </Fragment>
        );
    }
}
