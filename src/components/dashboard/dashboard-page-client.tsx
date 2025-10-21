'use client';

import { useUserPermissionsQuery } from '@/features/user';
import {
  canViewAndWriteAnnotationTasks,
  canViewSites,
} from '@/lib/user/permissions';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Loader2, PencilLine, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function DashboardPageClient() {
  const router = useRouter();
  const { data: permissions, isLoading } = useUserPermissionsQuery();

  const handleAnnotateClick = () => {
    router.push('/annotate');
  };

  const handleReviewClick = () => {
    router.push('/review');
  };

  const canAnnotate =
    permissions && canViewAndWriteAnnotationTasks(permissions);
  const canReview = permissions && canViewSites(permissions);
  const hasAnyAccess = canAnnotate || canReview;

  if (!hasAnyAccess) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-2xl items-center justify-center px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="bg-muted inline-flex h-12 w-12 items-center justify-center rounded-full">
            <Search className="text-muted-foreground h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">No Access Available</h2>
            <p className="text-muted-foreground max-w-md text-sm">
              You don&apos;t currently have access to any features. Please
              contact your administrator if you believe this is an error.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-2xl items-center justify-center px-6">
      <div className="w-full space-y-16">
        {/* Annotation Card - Only show if user can annotate */}
        {canAnnotate && (
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="space-y-3">
              <div className="bg-primary/10 text-primary ring-primary/20 inline-flex h-10 w-10 items-center justify-center rounded-full ring-1">
                <PencilLine className="h-5 w-5" />
              </div>
              <CardTitle className="tracking-tight">Start annotating</CardTitle>
              <CardDescription>
                Review and label your assigned tasks.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Access your queue and continue where you left off.
            </CardContent>
            <CardFooter className="flex items-end justify-end">
              <Button
                onClick={handleAnnotateClick}
                disabled={isLoading}
                size="sm"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Preparing...
                  </>
                ) : (
                  <>
                    Annotate
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Review Data Card - Show if user can view sites (privilege 0, 1, 2) */}
        {canReview && (
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20">
                <Search className="h-5 w-5" />
              </div>
              <CardTitle className="tracking-tight">Review Data</CardTitle>
              <CardDescription>
                Review and validate completed surveillance.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Browse and verify surveillance documentation quality and accuracy.
            </CardContent>
            <CardFooter className="flex items-end justify-end">
              <Button
                onClick={handleReviewClick}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Review Data
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
