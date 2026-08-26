import { Separator } from '@/components/ui/separator';
import AuthShell from '@/features/auth/components/auth-shell';
import SignupForm from '@/features/auth/components/signup-form';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function SignupPage() {
    const t = await getTranslations('Auth');

    return (
        <AuthShell
            title="Create your account"
            description="Set up access to your VectorVerify workspace."
            imageSrc="/assets/auth/images/Signup.png"
        >
            <SignupForm />
            <Separator className="my-6" />
            <p className="text-muted-foreground text-center text-sm">
                {t('existingAccountQuestion')}{' '}
                <Link
                    href="/login"
                    className="text-primary font-medium hover:underline"
                >
                    {t('loginLinkText')}
                </Link>
            </p>
        </AuthShell>
    );
}
