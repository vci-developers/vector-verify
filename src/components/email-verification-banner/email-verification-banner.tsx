'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function EmailVerificationBanner() {
    const t = useTranslations('Auth');
    return (
        <div className="text-muted-foreground bg-background sticky bottom-0 justify-center gap-1 py-6 text-center text-sm outline">
            {t('emailNotVerifiedBannerMessage')}{' '}
            <Link
                href="/email-verification"
                className="text-primary font-medium hover:underline"
            >
                {t('emailNotVerifiedBannerLink')}
            </Link>
        </div>
    );
}
