'use client';

import { Button } from '@/components/ui/button';
import { logoutAction } from '@/lib/auth/actions';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

export function LogoutButton() {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  async function logoutHandler() {
    try {
      startTransition(async () => {
        await logoutAction();
        router.push('/login');
        router.refresh();
      });
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';
      toast.error("Couldn't log you out", { description });
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={logoutHandler} disabled={isPending}>
      {isPending ? 'Logging out...' : 'Log out'}
    </Button>
  );
}
