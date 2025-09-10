'use client';

import { LogoutButton } from '@/components/auth/logout-button';
import { useSessionRefresher } from '@/lib/auth/hooks/use-session-refresher';

export function DashboardHeader() {
  // Keep session alive quietly in the background
  useSessionRefresher({ suppressToast: false });
  return (
    <header className="flex items-center justify-end p-4">
      <LogoutButton />
    </header>
  );
}

