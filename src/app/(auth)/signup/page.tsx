import { SignupForm } from '@/components/auth/signup-form';
import { signupAction } from '@/lib/auth/actions';

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-6 py-10">
      <SignupForm onSignup={signupAction} />
    </div>
  );
}
