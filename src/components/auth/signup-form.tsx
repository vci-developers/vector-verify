'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { AuthActionResult } from '@/lib/auth/actions';
import { SignupSchema, type SignupFormData } from '@/lib/auth/validation/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, Loader, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface SignupFormProps {
  onSignup: (formData: FormData) => Promise<AuthActionResult>;
}

export function SignupForm({ onSignup }: SignupFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  const rootError = form.formState.errors.root?.message;

  async function signupHandler(values: SignupFormData) {
    try {
      const formData = new FormData();
      formData.set('email', values.email);
      formData.set('password', values.password);

      startTransition(async () => {
        const response = await onSignup(formData);
        if (!response.ok) {
          form.setError('root', { message: response.error ?? 'Signup failed' });
        } else {
          router.push('/');
          router.refresh();
        }
      });
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';
      toast.error("Couldn't create your account", { description });
    }
  }

  return (
    <Card className="border-border/60 w-full rounded-2xl border shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl tracking-tight">
          Create your account
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Start your session in a few seconds.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-5">
        {rootError ? (
          <Alert
            variant="destructive"
            className="border-destructive/30 bg-destructive/10 mb-1"
          >
            <AlertDescription>{rootError}</AlertDescription>
          </Alert>
        ) : null}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(signupHandler)}
            className="space-y-5"
            noValidate
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm">
                    Email
                  </FormLabel>
                  <div className="relative">
                    <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="focus-visible:ring-primary/30 placeholder:text-muted-foreground/60 h-11 rounded-xl pl-10 transition focus-visible:ring-2"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-sm">
                    Password
                  </FormLabel>
                  <div className="relative">
                    <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="min 8 characters"
                        className="focus-visible:ring-primary/30 placeholder:text-muted-foreground/60 h-11 rounded-xl pr-12 pl-10 transition focus-visible:ring-2"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={() => setShowPassword(v => !v)}
                      className="hover:bg-muted absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="h-11 w-full rounded-xl shadow-sm transition-shadow hover:shadow-md"
              disabled={isPending}
            >
              {isPending ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {isPending ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </Form>
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
  );
}
