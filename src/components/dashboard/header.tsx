'use client';

import { LogoutButton } from '@/components/auth/logout-button';
import { BackButton } from './back-button';
import { Brand } from './brand';
import { useNavigationState } from './hooks/use-navigation-state';

/**
 * DashboardHeader component responsible for the main navigation layout
 * Single responsibility: Compose header layout with navigation elements
 */
export function DashboardHeader() {
  const { showBackButton } = useNavigationState();

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
