'use client';

import { Button } from '@/components/ui/button';
import { logoutAction } from '@/lib/auth/actions';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { showErrorToast } from '@/lib/shared/ui/show-error-toast';

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isPending, startTransition] = useTransition();

  async function logoutHandler() {
    try {
      startTransition(async () => {
        await logoutAction();
        queryClient.clear();
        router.push('/login');
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
