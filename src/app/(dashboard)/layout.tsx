import { redirect } from 'next/navigation';
import { Fragment } from 'react';
import { LogoutButton } from '@/components/auth/logout-button';
import { upstreamFetch } from '@/lib/http/upstream';
import { mapUserDtoToDomain } from '@/lib/mappers/user.mapper';
import type { UserProfileResponseDto } from '@/lib/dto/user';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const response = await upstreamFetch('users/profile', { method: 'GET' });

  if (!response.ok) {
    redirect('/login');
  }

  const data = (await response.json()) as UserProfileResponseDto;
  const user = mapUserDtoToDomain(data.user);

  if (!user) {
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
