import { Fragment } from 'react';
import { redirect } from 'next/navigation';
import { HydrationBoundary } from '@tanstack/react-query';
import { HttpError } from '@/lib/shared/http/core/http-error';
import { withRouteError } from '@/lib/shared/http/core';
import {
  userKeys,
  type UserProfileQueryKey,
  type UserPermissionsQueryKey,
} from '@/lib/user';
import { getServerUserProfile, getServerUserPermissions } from '@/lib/user/server';
import { DashboardHeader } from '@/components/dashboard/header';
import { dehydrateWithSeed } from '@/lib/shared/react-query/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';
import { LogoutButton } from '@/components/auth/logout-button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  try {
    const [user, permissions] = await Promise.all([
      getServerUserProfile(),
      getServerUserPermissions(),
    ]);

    if (!user || !permissions) {
      redirect('/login');
    }

    const dehydratedState = dehydrateWithSeed([
      { key: userKeys.profile() as UserProfileQueryKey, data: user },
      { key: userKeys.permissions() as UserPermissionsQueryKey, data: permissions },
    ]);

    return (
      <HydrationBoundary state={dehydratedState}>
        {user.isWhitelisted ? (
          <Fragment>
            <DashboardHeader />
            {children}
          </Fragment>
        ) : (
          <div className="mx-auto w-full max-w-2xl px-6 py-10">
            <Card className="rounded-2xl border shadow-sm">
              <CardHeader className="space-y-3">
                <div className="bg-warning/15 text-warning ring-warning/30 inline-flex h-10 w-10 items-center justify-center rounded-full ring-1">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <CardTitle className="tracking-tight">
                  Access restricted
                </CardTitle>
                <CardDescription>
                  Your account (
                  <span className="text-foreground font-medium">
                    {user.email}
                  </span>
                  ) isn't authorized yet. Please contact a member of our
                  technical team to request access.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    If you recently signed up, it may take up to 24 hours for us
                    to review your request.
                  </li>
                  <li>
                    You can sign out below and switch to an authorized account.
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="flex items-end justify-end">
                <LogoutButton />
              </CardFooter>
            </Card>
          </div>
        )}
      </HydrationBoundary>
    );
  } catch (error) {
    if (error instanceof HttpError) {
      redirect(withRouteError('/login', { message: error.message, status: error.status }));
    }
    redirect(withRouteError('/login', 'Failed to load your profile.'));
  }
}
