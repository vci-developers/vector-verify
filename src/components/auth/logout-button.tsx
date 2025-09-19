'use client';

import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useLogoutMutation } from '@/lib/auth/client';
import { useTransition } from 'react';
import { showErrorToast } from '@/lib/shared/ui/show-error-toast';

export function LogoutButton() {
  const queryClient = useQueryClient();

  const [isPending, startTransition] = useTransition();
  const logoutMutation = useLogoutMutation();

  async function logoutHandler() {
    try {
      startTransition(async () => {
        queryClient.clear();
        await logoutMutation.mutateAsync('/login');
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
