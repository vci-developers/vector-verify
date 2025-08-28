import LoginFooter from '@/feature/auth/login/components/login-footer';
import LoginForm from '@/feature/auth/login/components/login-form';
import LoginHeader from '@/feature/auth/login/components/login-header';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md space-y-8">
        <LoginHeader />
        <LoginForm />
        <LoginFooter />
      </div>
    </div>
  );
}
