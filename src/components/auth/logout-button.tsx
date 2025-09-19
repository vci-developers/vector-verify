'use client';

import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useLogoutMutation } from '@/lib/auth/client';
import { showErrorToast } from '@/lib/shared/ui/show-error-toast';

export function LogoutButton() {
  const queryClient = useQueryClient();

  const logoutMutation = useLogoutMutation();

  async function logoutHandler() {
    try {
      if (logoutMutation.isPending) return;
      queryClient.clear();
      await logoutMutation.mutateAsync('/login');
    } catch (error) {
      showErrorToast(error, "Couldn't log you out");
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={logoutHandler}
      disabled={logoutMutation.isPending}
    >
      {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
    </Button>
  );
}
