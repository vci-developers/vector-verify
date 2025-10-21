import { SignupForm } from '@/features/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-10">
      <div className="mx-auto w-full max-w-md">
        <Card className="border-border/60 bg-card overflow-hidden rounded-2xl border shadow-xl">
          <CardHeader className="space-y-2 border-b pb-4">
            <CardTitle className="text-2xl tracking-tight">
              Create your account
            </CardTitle>
            <CardDescription>
              Start your session in a few seconds.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <SignupForm />
          </CardContent>

          <CardFooter className="text-muted-foreground mt-1 border-t pt-4 text-sm">
            <span className="flex w-full items-center justify-between">
              <span>
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-foreground underline underline-offset-4"
                >
                  Sign in
                </Link>
              </span>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
