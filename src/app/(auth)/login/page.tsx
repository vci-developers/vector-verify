import { loginAction } from '@/lib/auth/actions';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-10">
      <LoginForm onLogin={loginAction} />
    </div>
  );
}
