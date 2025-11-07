'use client';

import { usePathname } from 'next/navigation';
import { DashboardHeader } from './header';

export function ConditionalHeader() {
  const pathname = usePathname();
  // Don't show header on landing page
  if (pathname === '/') {
    return null;
  }
  return <DashboardHeader />;
}


