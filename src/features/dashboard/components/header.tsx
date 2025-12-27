'use client';

import { useMemo } from 'react';
import { LogoutButton } from '@/features/auth';
import { BackButton } from './back-button';
import { Brand } from './brand';
import { usePathname } from 'next/navigation';


export function DashboardHeader() {
  const pathname = usePathname();
  const showBackButton = pathname !== '/';

  // Hide header on metrics dashboard page
  const isMetricsDashboard = pathname.match(/\/review\/[^/]+\/[^/]+\/dashboard$/);
  if (isMetricsDashboard) {
    return null;
  }

  const { district, monthYear } = useMemo(() => {
    const reviewMatch = pathname.match(/\/review\/([^/]+)\/([^/]+)/);
    if (reviewMatch) {
      return {
        district: reviewMatch[1],
        monthYear: reviewMatch[2],
      };
    }
    return { district: undefined, monthYear: undefined };
  }, [pathname]);

  return (
    <header className="bg-background flex items-center justify-between border-b p-4">
      <div className="flex items-center">
        <BackButton show={showBackButton} district={district} monthYear={monthYear} />
      </div>

      <Brand />

      <div className="flex items-center">
        <LogoutButton />
      </div>
    </header>
  );
}
