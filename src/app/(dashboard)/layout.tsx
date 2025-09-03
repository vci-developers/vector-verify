import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE } from '@/lib/auth/cookies';
import { Fragment } from 'react';
import { LogoutButton } from '@/components/auth/logout-button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const cookieJar = await cookies();
  const hasAccessToken = !!cookieJar.get(COOKIE.ACCESS)?.value;
  const hasRefreshToken = !!cookieJar.get(COOKIE.REFRESH)?.value;

  if (!hasAccessToken || !hasRefreshToken) {
    redirect('/login');
  }

  return (
    <Fragment>
      <header className="flex items-center justify-end p-4">
        <LogoutButton />
      </header>
      {children}
    </Fragment>
  );
}
