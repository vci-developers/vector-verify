'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/ui/button';
import {
  LayoutDashboard,
  Table,
  Users,
  Microscope,
  Home,
  List,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/shared/core/utils';
import Image from 'next/image';
import { useLogoutMutation } from '@/features/auth/hooks/use-logout';
import { useQueryClient } from '@tanstack/react-query';
import { showErrorToast } from '@/ui/show-error-toast';

interface DashboardSidebarProps {
  district: string;
  monthYear: string;
}

export function DashboardSidebar({
  district,
  monthYear,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutMutation = useLogoutMutation();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  async function handleLogout() {
    try {
      if (logoutMutation.isPending) return;
      queryClient.clear();
      await logoutMutation.mutateAsync('/login');
    } catch (error) {
      showErrorToast(error, "Couldn't log you out");
    }
  }

  const isActivePath = (path: string) => pathname === path;

  const encodedDistrict = encodeURIComponent(district);
  const encodedMonthYear = encodeURIComponent(monthYear);
  const basePath = `/review/${encodedDistrict}/${encodedMonthYear}`;

  const formattedMonthYear = useMemo(() => {
    const [year, monthNum] = monthYear.split('-').map(Number);
    return new Date(year, monthNum - 1, 1).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }, [monthYear]);

  return (
    <div className="flex flex-col h-fit sticky top-0 self-start" style={{ backgroundColor: '#fafcfa', width: '18%' }}>
      <div className="mx-auto w-full flex flex-col">
        <div className="border-b p-4">
          <div className="flex items-center justify-between gap-2">
            <Image
              src="/assets/auth/images/logo.png"
              alt="VectorCheck Logo"
              width={45}
              height={15}
              className="object-contain"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate('/')}
              className="shrink-0"
              aria-label="Return to home page"
            >
              <Home className="h-4 w-4 mr-1" />
              Home
            </Button>
          </div>
        </div>

      <div className="flex-1 p-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Data Review
            </h3>
            <div className="space-y-1">
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-10',
                  isActivePath('/review') && 'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-700'
                )}
                onClick={() => handleNavigate('/review')}
              >
                <List className={cn('h-4 w-4', isActivePath('/review') && 'text-green-600')} />
                <span>Review List</span>
              </Button>

              <div className="pl-4 pt-1 pb-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <span className="font-medium">
                    {district} - {formattedMonthYear}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-10 pl-8',
                  isActivePath(`${basePath}/dashboard`) &&
                    'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-700'
                )}
                onClick={() => handleNavigate(`${basePath}/dashboard`)}
              >
                <LayoutDashboard
                  className={cn(
                    'h-4 w-4',
                    isActivePath(`${basePath}/dashboard`) && 'text-green-600'
                  )}
                />
                <span>Dashboard</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-10 pl-8',
                  isActivePath(`${basePath}/master-table-view`) &&
                    'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-700'
                )}
                onClick={() => handleNavigate(`${basePath}/master-table-view`)}
              >
                <Table
                  className={cn(
                    'h-4 w-4',
                    isActivePath(`${basePath}/master-table-view`) && 'text-green-600'
                  )}
                />
                <span>Master Table View</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-10 pl-8',
                  isActivePath(`${basePath}/session-view`) &&
                    'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-700'
                )}
                onClick={() => handleNavigate(`${basePath}/session-view`)}
              >
                <Users
                  className={cn(
                    'h-4 w-4',
                    isActivePath(`${basePath}/session-view`) && 'text-green-600'
                  )}
                />
                <span>Session View</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-10 pl-8',
                  isActivePath(`${basePath}/specimen-view`) &&
                    'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-700'
                )}
                onClick={() => handleNavigate(`${basePath}/specimen-view`)}
              >
                <Microscope
                  className={cn(
                    'h-4 w-4',
                    isActivePath(`${basePath}/specimen-view`) && 'text-green-600'
                  )}
                />
                <span>Specimen View</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 h-10 pl-8',
                  isActivePath(`${basePath}/data-quality`) &&
                    'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-700'
                )}
                onClick={() => handleNavigate(`${basePath}/data-quality`)}
              >
                <AlertCircle
                  className={cn(
                    'h-4 w-4',
                    isActivePath(`${basePath}/data-quality`) && 'text-green-600'
                  )}
                />
                <span>Data Quality</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[200px]"></div>

      <div className="border-t p-4 pb-8">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-3 h-10"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <ArrowRight className="h-4 w-4" />
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
      </div>
    </div>
  );
}

