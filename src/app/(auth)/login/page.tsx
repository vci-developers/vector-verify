import { Separator } from '@/components/ui/separator';
import AuthShell from '@/features/auth/components/auth-shell';
import LoginForm from '@/features/auth/components/login-form';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function LoginPage() {
    const t = await getTranslations('Auth');

    return (
        <AuthShell
            title={t('welcomeBack')}
            description={t('signInToContinue')}
            imageSrc="/assets/auth/images/Login.png"
        >
            <LoginForm />
            <Separator className="my-6" />
            <p className="text-muted-foreground text-center text-sm">
                {t('noAccountQuestion')}{' '}
                <Link
                    href="/signup"
                    className="text-primary font-medium hover:underline"
                >
                    {t('createAccountLinkText')}
                </Link>
            </p>
        </AuthShell>
    );
}
