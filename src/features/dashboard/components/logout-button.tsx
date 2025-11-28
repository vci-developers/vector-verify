'use client';

import { Button } from '@/ui/button';
import { FiLogOut } from 'react-icons/fi';
import { useLogoutMutation } from '@/features/auth/hooks/use-logout';
import { useQueryClient } from '@tanstack/react-query';
import { showErrorToast } from '@/ui/show-error-toast';

export function LogoutButton() {
  const queryClient = useQueryClient();
  const logoutMutation = useLogoutMutation();

  async function handleLogout() {
    try {
      if (logoutMutation.isPending) return;
      queryClient.clear();
      await logoutMutation.mutateAsync('/login');
    } catch (error) {
      showErrorToast(error, "Couldn't log you out");
    }
  }

  return (
    <div className="absolute top-12 right-12">
      <Button
        variant="outline"
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className="h-10 cursor-pointer border-gray-300 text-gray-700 disabled:cursor-not-allowed"
      >
        <FiLogOut className="mr-2 h-4 w-4" />
        {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
      </Button>
    </div>
  );
}
