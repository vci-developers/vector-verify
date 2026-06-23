import LogoutButton from '@/components/auth-session/logout-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { Hourglass, ShieldX } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface ForbiddenPageProps {
    searchParams: Promise<{
        reason?: string;
    }>;
}

export default async function ForbiddenPage({
    searchParams,
}: ForbiddenPageProps) {
    const { reason: accessDenialReason } = await searchParams;
    const isPendingApproval = accessDenialReason === 'not-whitelisted';
    const VariantIcon = isPendingApproval ? Hourglass : ShieldX;
    const titleKey = isPendingApproval
        ? 'notWhitelistedTitle'
        : 'noAccessTitle';
    const descriptionKey = isPendingApproval
        ? 'notWhitelistedDescription'
        : 'noAccessDescription';
    const t = await getTranslations('Auth');

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-6">
            <div
                className={cn(
                    'rounded-full p-6',
                    isPendingApproval ? 'bg-success/10' : 'bg-destructive/10',
                )}
            >
                <VariantIcon
                    className={cn(
                        'h-12 w-12',
                        isPendingApproval ? 'text-success' : 'text-destructive',
                    )}
                />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-semibold">{t(titleKey)}</h1>
                <p className="text-muted-foreground max-w-sm text-sm">
                    {t(descriptionKey)}
                </p>
            </div>
            <div className="flex flex-col items-center gap-4">
                {!isPendingApproval && (
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/">{t('returnHome')}</Link>
                    </Button>
                )}
                <LogoutButton />
            </div>
        </div>
    );
}
