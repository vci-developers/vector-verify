'use client';

import { Alert, AlertDescription } from '@/ui/alert';
import { Button } from '@/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form';
import { Input } from '@/ui/input';
import {
  type LoginFormData,
  LoginSchema,
} from '@/features/auth/components/validation/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Eye, EyeOff, Loader, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { showErrorToast } from '@/ui/show-error-toast';
import { useLoginMutation } from '@/features/auth/hooks/use-login';

export function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  const rootError = form.formState.errors.root?.message;

  async function loginHandler(data: LoginFormData) {
    try {
      const result = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
      if (!result || result.error) {
        form.setError('root', {
          message: result?.error || 'Invalid email or password',
        });
        return;
      }
      router.replace('/');
      router.refresh();
    } catch (error) {
      showErrorToast(error, "Couldn't log you in");
    }
  }

  function togglePasswordVisibilityHandler() {
    setShowPassword(currentVisibility => !currentVisibility);
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
          onSubmit={form.handleSubmit(loginHandler)}
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
                      autoComplete="current-password"
                      placeholder="••••••••"
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
                    onClick={togglePasswordVisibilityHandler}
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
            className="h-11 w-full rounded-xl shadow-sm transition-all hover:shadow-md bg-gradient-to-r from-chart-green-medium/90 to-chart-green-light text-white hover:from-chart-green-medium/80 hover:to-chart-green-light/90"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
