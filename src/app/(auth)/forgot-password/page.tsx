import { Separator } from '@/components/ui/separator';
import AuthShell from '@/features/auth/components/auth-shell';
import ForgotPasswordForm from '@/features/auth/components/forgot-password-form';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function ForgotPasswordPage() {
    const t = await getTranslations('Auth');
    return (
        <AuthShell
            title={t('forgotPassword')}
            description={t('forgotPasswordDescription')}
            imageSrc="/assets/auth/images/Login.png"
        >
            <ForgotPasswordForm></ForgotPasswordForm>
            <Separator className="my-6" />
            <p className="text-muted-foreground text-center text-sm">
                <Link
                    href="/login"
                    className="text-primary font-medium hover:underline"
                >
                    {t('returnToLogin')}
                </Link>
            </p>
        </AuthShell>
    );
}
