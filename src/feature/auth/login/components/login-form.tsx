'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginForm() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    router.push('/');
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember-me" />
            <Label htmlFor="remember-me">Remember me</Label>
          </div>

          <Button asChild variant="link" size="sm" className="px-0 text-sm">
            <Link href="#">Forgot password?</Link>
          </Button>
        </div>

        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
      <Button asChild variant="link" className="w-full justify-center text-sm">
        <Link href="/register">Don't have an account? Register</Link>
      </Button>
    </Fragment>
  );
}
