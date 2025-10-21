'use client';

import { LogoutButton } from '@/features/auth';
import { BackButton } from './back-button';
import { Brand } from './brand';
import { usePathname } from 'next/navigation';

/**
 * DashboardHeader component responsible for the main navigation layout
 * Single responsibility: Compose header layout with navigation elements
 */
export function DashboardHeader() {
  const pathname = usePathname();
  const showBackButton = pathname !== '/';

  return (
    <header className="bg-background flex items-center justify-between border-b p-4">
      {/* Left side - Back button */}
      <div className="flex items-center">
        <BackButton show={showBackButton} />
      </div>

      {/* Center - Brand name */}
      <Brand />

      {/* Right side - Logout button */}
      <div className="flex items-center">
        <LogoutButton />
      </div>
    </header>
  );
}
