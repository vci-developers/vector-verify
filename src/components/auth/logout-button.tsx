'use client';

import { Button } from '@/components/ui/button';
import { logoutAction } from '@/lib/auth/actions';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function LogoutButton() {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  async function logoutHandler() {
    startTransition(async () => {
      await logoutAction();
      router.push('/login');
      router.refresh();
    });
  }

  return (
    <Button variant="outline" size="sm" onClick={logoutHandler}>
      {isPending ? 'Logging out…' : 'Log out'}
    </Button>
  );
}
