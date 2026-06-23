import AuthShell from '@/features/auth/components/auth-shell';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyEmail } from '@/api/auth/verify-email';
import { ACCESS_COOKIE_NAME } from '@/lib/auth-session/cookies';
import { Button } from '@/components/ui/button';

interface VerifyEmailPageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({
    searchParams,
}: VerifyEmailPageProps) {
    function resendVerificationCode() {}

    const accessToken = (await cookies()).get(ACCESS_COOKIE_NAME)?.value;
    if (!accessToken) return;

    const { token } = await searchParams;
    if (!token) {
        return (
            <AuthShell
                title="Verify your email"
                description="Email verification in progress."
                imageSrc="/assets/auth/images/Login.png"
            >
                <p>Invalid email verification link. Please check your email.</p>
            </AuthShell>
        );
    } else {
        const response = await verifyEmail(accessToken, {
            token,
        });

        if (!response.ok) {
            console.error(
                'Email Verification Failed: ',
                response.error.message,
            );
            return (
                <AuthShell
                    title="Verify your email"
                    description="Email verification in progress."
                    imageSrc="/assets/auth/images/Login.png"
                >
                    {response.error.message ===
                    'Verification token is required' ? (
                        <>
                            <p className="text-muted-foreground text-center text-sm">
                                Invalid email verification link. Please check
                                your email for the link or click the button to
                                receive the verification email.
                            </p>
                            <Button onClick={resendVerificationCode}>
                                Resend verification email
                            </Button>
                        </>
                    ) : response.error.message ===
                      'Invalid or expired verification token' ? (
                        <>
                            <p className="text-muted-foreground text-center text-sm">
                                Invalid verification code.
                            </p>
                            <Button onClick={resendVerificationCode}>
                                Resend verification email
                            </Button>
                        </>
                    ) : response.error.message ===
                      'Verification token does not match the authenticated user' ? (
                        <p className="text-muted-foreground text-center text-sm">
                            Please log in with the account that received the
                            verification email.
                        </p>
                    ) : (
                        <p className="text-muted-foreground text-center text-sm">
                            response.error.message
                        </p>
                    )}
                </AuthShell>
            );
        } else {
            redirect('/');
        }
    }
}
