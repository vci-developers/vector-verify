import { Button } from '@/components/ui/button';
import AuthShell from '@/features/auth/components/auth-shell';
import ResetPasswordForm from '@/features/auth/components/reset-password-form';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface ResetPasswordPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
    searchParams,
}: ResetPasswordPageProps) {
    const { token } = await searchParams;
    const t = await getTranslations('Auth');

    return (
        <AuthShell
            title={t('resetPassword')}
            description={t('resetPasswordDescription')}
            imageSrc="/assets/auth/images/Login.png"
        >
            {!token ? (
                <div className="flex flex-col items-center gap-4">
                    <p className="text-muted-foreground text-center text-sm">
                        {t('invalidResetPasswordLink')}
                    </p>
                    <Link className="w-full" href="/forgot-password">
                        <Button className="w-full">
                            {t('forgotPassword')}
                        </Button>
                    </Link>
                </div>
            ) : (
                <ResetPasswordForm token={token} />
            )}
        </AuthShell>
    );
}
