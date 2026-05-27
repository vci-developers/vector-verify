import { Separator } from '@/components/ui/separator';
import AuthShell from '@/features/auth/components/auth-shell';
import ForgotPasswordForm from '@/features/auth/components/forgot-password-form';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    return (
        <AuthShell
            title="Forgot password"
            description="Enter your email to receive a link to reset your password."
            imageSrc="/assets/auth/images/Login.png"
        >
            {/* Note: imageSrc is currently a placeholder, cannot pass an empty imageSrc without issues */}
            <ForgotPasswordForm></ForgotPasswordForm>
            <Separator className="my-6" />
            <p className="text-muted-foreground text-center text-sm">
                <Link
                    href="/login"
                    className="text-primary font-medium hover:underline"
                >
                    Return to login
                </Link>
            </p>
        </AuthShell>
    );
}
