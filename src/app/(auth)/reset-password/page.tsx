import { Button } from '@/components/ui/button';
import AuthShell from '@/features/auth/components/auth-shell';
import ResetPasswordForm from '@/features/auth/components/reset-password-form';
import { getTranslations } from 'next-intl/server';

interface ResetPasswordPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({
    searchParams,
}: ResetPasswordPageProps) {
    const { token } = await searchParams;
    const t = await getTranslations('Auth');

    return !token ? (
        <AuthShell
            title={t('resetPassword')}
            description={t('resetPasswordDescription')}
            imageSrc="/assets/auth/images/Login.png"
        >
            <div className="flex flex-col items-center gap-4">
                <p className="text-muted-foreground text-center text-sm">
                    {t('invalidResetPasswordLink')}
                </p>
                <Button className="w-full">{t('forgotPassword')}</Button>
            </div>
        </AuthShell>
    ) : (
        <AuthShell
            title={t('resetPassword')}
            description={t('resetPasswordDescription')}
            imageSrc="/assets/auth/images/Login.png"
        >
            <ResetPasswordForm token={token} />
        </AuthShell>
    );
}
