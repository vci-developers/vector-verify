'use client';

import { LogoutButton } from '@/components/auth/logout-button';

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-end p-4">
      <LogoutButton />
    </header>
  );
}
