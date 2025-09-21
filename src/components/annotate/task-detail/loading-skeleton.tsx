import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AnnotationTaskDetailSkeleton() {
  return (
    <div className="mx-auto grid h-full w-full max-w-6xl gap-6 p-6 md:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.9fr)]">
      <Card className="flex h-full flex-col overflow-hidden shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <Skeleton className="h-[55vh] min-h-[320px] w-full rounded-lg" />
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col overflow-hidden shadow-sm">
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="flex-1 space-y-3 text-sm">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-16 w-full rounded-md" />
        </CardContent>
        <CardFooter className="mt-auto flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Skeleton className="h-9 w-28 min-w-[120px] rounded-md" />
          <Skeleton className="h-9 w-28 min-w-[120px] rounded-md" />
        </CardFooter>
      </Card>
    </div>
  );
}
