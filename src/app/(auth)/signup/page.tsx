'use client';

import { Separator } from '@/components/ui/separator';
import AuthShell from '@/features/auth/components/auth-shell';
import EmailVerificationForm from '@/features/auth/components/email-verification-form';
import SignupForm from '@/features/auth/components/signup-form';
import Link from 'next/link';
import { useState } from 'react';

export default function SignupPage() {
    const [showVerify, setShowVerify] = useState(false);
    if (!showVerify) {
        return (
            <AuthShell
                title="Create your account"
                description="Set up access to your VectorVerify workspace."
                imageSrc="/assets/auth/images/Signup.png"
            >
                <SignupForm setShowVerify={setShowVerify} />
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
