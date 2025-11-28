import { AuthLayout } from '@/features/auth/components/auth-layout';
import { SignupForm } from '@/features/auth';

export default function SignupPage() {
  return (
    <AuthLayout
      illustrationSrc="/assets/auth/images/Signup.png"
      illustrationAlt="Signup illustration"
      title="Create Your Account"
      description="Start your session in a few seconds."
      linkText="Already have an account?"
      linkHref="/login"
      linkLabel="Sign in"
    >
      <SignupForm />
    </AuthLayout>
  );
}
