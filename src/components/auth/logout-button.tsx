'use client';

import { Button } from '@/components/ui/button';
import { authActions } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { showErrorToast } from '@/lib/shared/ui/show-error-toast';

export function LogoutButton() {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  async function logoutHandler() {
    try {
      startTransition(async () => {
        await authActions.logoutAction();
        router.push('/login');
        router.refresh();
      });
    } catch (error) {
      showErrorToast(error, "Couldn't log you out");
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={logoutHandler}
      disabled={isPending}
    >
      {isPending ? 'Logging out...' : 'Log out'}
    </Button>
  );
}
