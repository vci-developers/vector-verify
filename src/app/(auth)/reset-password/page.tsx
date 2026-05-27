import AuthShell from '@/features/auth/components/auth-shell';
import ResetPasswordForm from '@/features/auth/components/reset-password-form';
export default function ResetPasswordPage() {
    return (
        <AuthShell
            title="Reset password"
            description="Enter your new password and re-enter it to confirm the change."
            imageSrc="/assets/auth/images/Login.png"
        >
            {/* Note: imageSrc is currently a placeholder, cannot pass an empty imageSrc without issues */}
            <ResetPasswordForm />
        </AuthShell>
    );
}
