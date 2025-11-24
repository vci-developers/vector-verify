'use client';

import { useState } from 'react';
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
import { Menu, LayoutDashboard, Table, Users, Microscope, X, Home, List, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/core/utils';

interface BackButtonProps {
  show: boolean;
  district?: string;
  monthYear?: string;
}

export function BackButton({ show, district, monthYear }: BackButtonProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const isActivePath = (path: string) => pathname === path;

  const isInReview = district && monthYear;
  const isOnReviewList = pathname === '/review';
  const isInAnnotation = pathname.startsWith('/annotate');
  const isOnAnnotationList = pathname === '/annotate';

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
              <DrawerTitle>Navigation</DrawerTitle>
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
                      "w-full justify-start gap-3 h-10",
                      isOnReviewList && "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-700"
                    )}
                    onClick={() => handleNavigate('/review')}
                  >
                    <List className={cn("h-4 w-4", isOnReviewList && "text-green-600")} />
                    <span>Review List</span>
                  </Button>
                  
                  {isInReview && (
                    <>
                      <div className="pl-4 pt-1 pb-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <ChevronRight className="h-3 w-3" />
                          <span className="font-medium">{decodeURIComponent(district)} - {decodeURIComponent(monthYear)}</span>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-10 pl-8",
                          isActivePath(`/review/${district}/${monthYear}/dashboard`) && 
                          "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-700"
                        )}
                        onClick={() => handleNavigate(`/review/${district}/${monthYear}/dashboard`)}
                      >
                        <LayoutDashboard className={cn(
                          "h-4 w-4",
                          isActivePath(`/review/${district}/${monthYear}/dashboard`) && "text-green-600"
                        )} />
                        <span>Dashboard</span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-10 pl-8",
                          isActivePath(`/review/${district}/${monthYear}/master-table-view`) && 
                          "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-700"
                        )}
                        onClick={() => handleNavigate(`/review/${district}/${monthYear}/master-table-view`)}
                      >
                        <Table className={cn(
                          "h-4 w-4",
                          isActivePath(`/review/${district}/${monthYear}/master-table-view`) && "text-green-600"
                        )} />
                        <span>Master Table View</span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-10 pl-8",
                          isActivePath(`/review/${district}/${monthYear}/session-view`) && 
                          "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-700"
                        )}
                        onClick={() => handleNavigate(`/review/${district}/${monthYear}/session-view`)}
                      >
                        <Users className={cn(
                          "h-4 w-4",
                          isActivePath(`/review/${district}/${monthYear}/session-view`) && "text-green-600"
                        )} />
                        <span>Session View</span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-10 pl-8",
                          isActivePath(`/review/${district}/${monthYear}/specimen-view`) && 
                          "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-700"
                        )}
                        onClick={() => handleNavigate(`/review/${district}/${monthYear}/specimen-view`)}
                      >
                        <Microscope className={cn(
                          "h-4 w-4",
                          isActivePath(`/review/${district}/${monthYear}/specimen-view`) && "text-green-600"
                        )} />
                        <span>Specimen View</span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-10 pl-8",
                          isActivePath(`/review/${district}/${monthYear}/data-quality`) && 
                          "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-700"
                        )}
                        onClick={() => handleNavigate(`/review/${district}/${monthYear}/data-quality`)}
                      >
                        <AlertCircle className={cn(
                          "h-4 w-4",
                          isActivePath(`/review/${district}/${monthYear}/data-quality`) && "text-green-600"
                        )} />
                        <span>Data Quality</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t" />

              {/* Annotation Section */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Annotation
                </h3>
                <div className="space-y-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      isOnAnnotationList && "bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-700"
                    )}
                    onClick={() => handleNavigate('/annotate')}
                  >
                    <List className={cn("h-4 w-4", isOnAnnotationList && "text-green-600")} />
                    <span>Annotation Tasks</span>
                  </Button>
                  
                  {isInAnnotation && !isOnAnnotationList && (
                    <div className="pl-4 pt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ChevronRight className="h-3 w-3" />
                        <span className="font-medium">Currently annotating</span>
                      </div>
                    </div>
                  )}
                </div>
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
