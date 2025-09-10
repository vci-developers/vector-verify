'use client';

import { LogoutButton } from '@/components/auth/logout-button';
import { useSessionRefresherQuery } from '@/lib/auth';

export function DashboardHeader() {
  useSessionRefresherQuery({ suppressToast: false });
  return (
    <header className="flex items-center justify-end p-4">
      <LogoutButton />
    </header>
  );
}
