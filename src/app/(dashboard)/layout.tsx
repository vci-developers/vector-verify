import { Fragment } from 'react';
import { redirect } from 'next/navigation';
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import { parseApiError } from '@/lib/shared/http/core';
import { upstreamFetch } from '@/lib/shared/http/server';
import { withRouteError } from '@/lib/shared/http/core';
import type { UserProfileResponseDto } from '@/lib/user';
import { mapUserDtoToDomain } from '@/lib/user';
import { DashboardHeader } from '@/components/dashboard/header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  try {
    const response = await upstreamFetch('users/profile', { method: 'GET' });
    if (!response.ok) {
      const message = await parseApiError(response);
      redirect(withRouteError('/login', { message, status: response.status }));
    }
    const data = (await response.json()) as UserProfileResponseDto;
    const user = mapUserDtoToDomain(data.user);
    if (!user) {
      redirect('/login');
    }

    const queryClient = new QueryClient();
    queryClient.setQueryData(['user', 'profile'], user);
    const dehydratedState = dehydrate(queryClient);

    return (
      <HydrationBoundary state={dehydratedState}>
        <Fragment>
          <DashboardHeader />
          {children}
        </Fragment>
      </HydrationBoundary>
    );
  } catch {
    redirect(withRouteError('/login', 'Failed to load your profile.'));
  }
}
