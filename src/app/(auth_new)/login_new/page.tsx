import { Separator } from '@/components/ui/separator';
import AuthShell from '@/features/auth_new/components/auth-shell';
import LoginForm from '@/features/auth_new/components/login-form';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <AuthShell
            title="Welcome back"
            description="Sign in to continue to your dashboard."
            imageSrc="/assets/auth/images/login.png"
        >
            <LoginForm />
            <Separator className="my-6" />
            <p className="text-muted-foreground text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link
                    href="/signup_new"
                    className="text-primary font-medium hover:underline"
                >
                    Create one
                </Link>
            </p>
        </AuthShell>
    );
}
