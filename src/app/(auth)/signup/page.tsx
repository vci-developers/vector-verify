import { Separator } from '@/components/ui/separator';
import AuthShell from '@/features/auth/components/auth-shell';
import SignupForm from '@/features/auth/components/signup-form';
import Link from 'next/link';

export default async function SignupPage() {
    const authShellProps = {
        title: 'Create your account',
        description: 'Set up access to your VectorVerify workspace.',
        imageSrc: '/assets/auth/images/signup.png',
    };

    return (
        <AuthShell {...authShellProps}>
            <SignupForm />
            <Separator className="my-6" />
            <p className="text-muted-foreground text-center text-sm">
                Already have an account?{' '}
                <Link
                    href="/login"
                    className="text-primary font-medium hover:underline"
                >
                    Login instead
                </Link>
            </p>
        </AuthShell>
    );
}
