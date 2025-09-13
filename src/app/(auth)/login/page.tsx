import { authActions } from '@/lib/auth';
import { LoginForm } from '@/components/auth/login-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-md">
        <Card className="border-border/60 bg-card rounded-2xl border shadow-xl overflow-hidden">
          <CardHeader className="space-y-2 border-b pb-4">
              <CardTitle className="text-2xl tracking-tight">
                Welcome back
              </CardTitle>
              <CardDescription>
                Sign in to continue to your dashboard.
              </CardDescription>
          </CardHeader>

          <CardContent>
            <LoginForm onLogin={authActions.loginAction} />
          </CardContent>

          <CardFooter className="text-muted-foreground mt-1 border-t pt-4 text-sm">
            <span className="flex w-full items-center justify-between">
              <span>
                No account?{' '}
                <Link
                  href="/signup"
                  className="text-foreground underline underline-offset-4"
                >
                  Create one
                </Link>
              </span>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
