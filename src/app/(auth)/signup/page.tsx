import { getPrograms } from '@/api/program/get-programs';
import ErrorBanner from '@/components/ui/error-banner';
import { Separator } from '@/components/ui/separator';
import AuthShell from '@/features/auth/components/auth-shell';
import SignupForm from '@/features/auth/components/signup-form';
import Link from 'next/link';

export default async function SignupPage() {
    const getProgramsResult = await getPrograms();
    const authShellProps = {
        title: 'Create your account',
        description: 'Set up access to your VectorVerify workspace.',
        imageSrc: '/assets/auth/images/signup.png',
    };

    if (!getProgramsResult.ok) {
        return (
            <AuthShell {...authShellProps}>
                <ErrorBanner errorMessage="Unable to load programs. Please try again later." />
            </AuthShell>
        );
    }

    const programs = getProgramsResult.data.programs;

    return (
        <AuthShell
            title="Create your account"
            description="Set up access to your VectorVerify workspace."
            imageSrc="/assets/auth/images/signup.png"
        >
            <SignupForm programs={programs} />
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
