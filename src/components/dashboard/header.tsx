'use client';

import { LogoutButton } from '@/components/auth/logout-button';
import { useSessionRefresher } from '@/lib/auth';

export function DashboardHeader() {
  useSessionRefresher({ suppressToast: false });
  return (
    <header className="flex items-center justify-end p-4">
      <LogoutButton />
    </header>
  );
}

