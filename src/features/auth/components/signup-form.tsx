'use client';

import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import {
  SignupSchema,
  type SignupFormData,
} from '@/features/auth/components/validation/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, Loader, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSignUpMutation } from '@/features/auth/hooks/use-signup';
import { useLoginMutation } from '@/features/auth/hooks/use-login';

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const signupMutation = useSignUpMutation();
  const loginMutation = useLoginMutation();
  const isPending = signupMutation.isPending || loginMutation.isPending;

  const form = useForm<SignupFormData>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
    mode: 'onSubmit',
  });

  const rootError = form.formState.errors.root?.message;

  async function signupHandler(values: SignupFormData) {
    form.clearErrors('root');
    try {
      await signupMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      const login = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      if (!login || login.error) {
        form.setError('root', {
          message: login?.error || 'Account created, but auto login failed',
        });
        return;
      }
      router.replace('/');
      router.refresh();
    } catch (error: unknown) {
      const msg =
        typeof (error as Error)?.message === 'string'
          ? (error as Error).message
          : "Couldn't create your account";
      form.setError('root', { message: msg });
    }
  }

  return (
    <div className="grid gap-5">
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
                <FormLabel className="text-foreground text-sm">Email</FormLabel>
                <div className="relative">
                  <Mail className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="bg-muted/20 focus-visible:ring-primary/30 placeholder:text-muted-foreground/60 h-11 rounded-xl pl-10 transition focus-visible:ring-2"
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
                      className="bg-muted/20 focus-visible:ring-primary/30 placeholder:text-muted-foreground/60 h-11 rounded-xl pr-12 pl-10 transition focus-visible:ring-2"
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground text-sm">
                  Confirm Password
                </FormLabel>
                <div className="relative">
                  <Lock className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <FormControl>
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="confirm your password"
                      className="bg-muted/20 focus-visible:ring-primary/30 placeholder:text-muted-foreground/60 h-11 rounded-xl pr-12 pl-10 transition focus-visible:ring-2"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="h-11 w-full rounded-xl shadow-sm transition-all hover:shadow-md"
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
    </div>
  );
}
