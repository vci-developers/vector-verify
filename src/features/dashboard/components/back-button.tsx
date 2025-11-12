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
import { Menu, LayoutDashboard, Table, Users, Microscope, X, Home, FileEdit } from 'lucide-react';
import { cn } from '@/shared/core/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

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

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="left">
      <DrawerTrigger asChild>
        <Button 
          variant="outline" 
          size="lg"
          className="shrink-0"
          aria-label="Open navigation menu"
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
                  {district && monthYear ? (
                    <>
                      {decodeURIComponent(district)} - {decodeURIComponent(monthYear)}
                    </>
                  ) : (
                    'Navigation'
                  )}
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
            <div className="space-y-4">
              {district && monthYear && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Review</label>
                  <Select onValueChange={handleNavigate} value={pathname}>
                    <SelectTrigger className="w-full h-12 text-base">
                      <SelectValue placeholder="Select review feature" />
                    </SelectTrigger>
                    <SelectContent>
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActivePath(item.path);
                        return (
                          <SelectItem 
                            key={item.path} 
                            value={item.path} 
                            className={cn(
                              "h-12 text-base",
                              isActive && "bg-green-50 text-green-700 data-[highlighted]:bg-green-100"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className={cn("h-5 w-5", isActive && "text-green-600")} />
                              <span>{item.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(pathname === '/review' || pathname.startsWith('/annotate')) && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Data Review</label>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full h-12 justify-start gap-3 text-base",
                      pathname === '/review' && "bg-green-50 border-green-400 text-green-700 hover:bg-green-100"
                    )}
                    onClick={() => handleNavigate('/review')}
                  >
                    <Table className={cn("h-5 w-5", pathname === '/review' && "text-green-600")} />
                    <span>Review List</span>
                  </Button>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Annotation</label>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start gap-3 text-base",
                    pathname.startsWith('/annotate') && "bg-green-50 border-green-400 text-green-700 hover:bg-green-100"
                  )}
                  onClick={() => handleNavigate('/annotate')}
                >
                  <FileEdit className={cn("h-5 w-5", pathname.startsWith('/annotate') && "text-green-600")} />
                  <span>Annotation Tasks</span>
                </Button>
              </div>
            </div>
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
