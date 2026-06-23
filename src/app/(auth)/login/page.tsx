import { Separator } from '@/components/ui/separator';
import AuthShell from '@/features/auth/components/auth-shell';
import EmailVerificationForm from '@/features/auth/components/email-verification-prompt';
import LoginForm from '@/features/auth/components/login-form';
import { ACCESS_COOKIE_NAME } from '@/lib/auth-session/cookies';
import { cookies } from 'next/dist/server/request/cookies';
import Link from 'next/link';

export default async function LoginPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

    if (!accessToken) {
        return (
            <AuthShell
                title="Welcome back"
                description="Sign in to continue to your dashboard."
                imageSrc="/assets/auth/images/Login.png"
            >
                <LoginForm />
                <Separator className="my-6" />
                <p className="text-muted-foreground text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link
                        href="/signup"
                        className="text-primary font-medium hover:underline"
                    >
                        Create one
                    </Link>
                </p>
            </AuthShell>
        );
    } else {
        return (
            <AuthShell
                title="Verify your email"
                description="Press 'Verify email' to send a verification email to your email address, then click the link to verify."
                imageSrc="/assets/auth/images/Login.png"
            >
                <EmailVerificationForm />
            </AuthShell>
        );
    }
}
