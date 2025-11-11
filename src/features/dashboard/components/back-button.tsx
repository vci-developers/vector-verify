'use client';

import { useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/drawer';
import { Menu, LayoutDashboard, Table, Users, Microscope, X, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/core/utils';

interface BackButtonProps {
  show: boolean;
  district?: string;
  monthYear?: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}


export function BackButton({ show, district, monthYear }: BackButtonProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = useMemo(
    () => [
      {
        label: 'Dashboard',
        path: `/review/${district}/${monthYear}/dashboard`,
        icon: LayoutDashboard,
        description: 'Overview and statistics',
      },
      {
        label: 'Master Table View',
        path: `/review/${district}/${monthYear}/master-table-view`,
        icon: Table,
        description: 'Detailed data table',
      },
      {
        label: 'Session View',
        path: `/review/${district}/${monthYear}/session-view`,
        icon: Users,
        description: 'Session details and forms',
      },
      {
        label: 'Specimen View',
        path: `/review/${district}/${monthYear}/specimen-view`,
        icon: Microscope,
        description: 'Specimen images and data',
      },
    ],
    [district, monthYear],
  );

  const handleNavigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const isActivePath = (path: string) => pathname === path;

  if (!show) {
    return <div className="w-20" />;
  }

  if (!district || !monthYear) {
    const handleBackClick = () => {
      router.back();
    };

    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleBackClick}
        className="flex items-center gap-2"
        aria-label="Go back to previous page"
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="left">
      <DrawerTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="shrink-0"
          aria-label="Open review navigation menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-80 rounded-none">
        <div className="flex h-full flex-col">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <DrawerTitle>
                  {decodeURIComponent(district)} - {decodeURIComponent(monthYear)}
                </DrawerTitle>
              </div>
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
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-2" aria-label="Review sections">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNavigate(item.path)}
                    className={cn(
                      'w-full flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                      isActive
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:bg-accent hover:text-accent-foreground'
                    )}
                    aria-label={`Navigate to ${item.label}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', isActive && 'text-primary')} />
                    <div className="flex-1 space-y-1">
                      <div className="font-medium leading-none">{item.label}</div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
          <DrawerFooter className="border-t">
            <DrawerClose asChild>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                aria-label="Close navigation menu"
              >
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
