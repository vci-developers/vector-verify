'use client';

import { LogoutButton } from '@/components/auth/logout-button';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [showBackButton, setShowBackButton] = useState(false);

  useEffect(() => {
    // Show back button only if we're not on the main dashboard page
    // and there's meaningful navigation history
    const isMainDashboard = pathname === '/';
    const hasHistory = window.history.length > 1;

    setShowBackButton(!isMainDashboard && hasHistory);
  }, [pathname]);

  const handleBackClick = () => {
    router.back();
  };

  return (
    <header className="bg-background flex items-center justify-between border-b p-4">
      {/* Left side - Back button (conditionally rendered) */}
      <div className="flex items-center">
        {showBackButton ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
        ) : (
          <div className="w-20" /> // Spacer to maintain layout balance
        )}
      </div>

      {/* Center - Brand name */}
      <div className="flex items-center">
        <h1 className="text-foreground text-xl font-semibold">VectorVerify</h1>
      </div>

      {/* Right side - Logout button */}
      <div className="flex items-center">
        <LogoutButton />
      </div>
    </header>
  );
}
