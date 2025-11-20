import { AuthLayout } from '@/features/auth/components/auth-layout';
import { LoginForm } from '@/features/auth';

export default function LoginPage() {
  return (
    <AuthLayout
      illustrationSrc="/assets/auth/images/Login.png"
      illustrationAlt="Login illustration"
      title="Welcome Back"
      description="Sign in to continue to your dashboard."
      linkText="Don't have an account?"
      linkHref="/signup"
      linkLabel="Create one"
    >
      <LoginForm />
    </AuthLayout>
  );
}
