import { Card, CardContent, CardFooter, CardHeader } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';

const getLayoutClass = (shouldProcessFurther: boolean) => {
  if (shouldProcessFurther) {
    return 'mx-auto grid h-full w-full max-w-[1800px] gap-6 p-6 md:grid-cols-[minmax(0,1.4fr)_minmax(380px,1fr)_minmax(380px,1fr)]';
  }
  return 'mx-auto grid h-full w-full max-w-6xl gap-6 p-6 md:grid-cols-[1fr_1fr]';
};
const statusGridClass =
  'grid gap-2 justify-items-center sm:grid-cols-2 sm:justify-items-stretch lg:grid-cols-3';
const statusCardClass =
  'flex w-full min-h-[60px] min-w-[120px] flex-col items-center justify-center rounded-xl bg-muted/30 px-2.5 py-2.5 sm:flex-row sm:min-w-[140px] sm:justify-between sm:gap-2.5';

const StatusSkeleton = () => (
  <div className={statusCardClass}>
    <Skeleton className="h-9 w-9 rounded-lg" />
    <div className="mt-2 flex min-w-0 flex-1 flex-col items-center text-center sm:mt-0">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-2 h-5 w-8" />
    </div>
  </div>
);

interface AnnotationTaskDetailSkeletonProps {
  shouldProcessFurther?: boolean;
}

export function AnnotationTaskDetailSkeleton({
  shouldProcessFurther = false,
}: AnnotationTaskDetailSkeletonProps) {
  const layoutClass = getLayoutClass(shouldProcessFurther);

  return (
    <div className={layoutClass}>
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
        <CardHeader className="space-y-4">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-32" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-2 flex-1 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <div className={statusGridClass}>
              {Array.from({ length: 3 }, (_, index) => (
                <StatusSkeleton key={index} />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-3 text-sm">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-16 w-full rounded-md" />
        </CardContent>
        <CardFooter className="mt-auto flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-9 w-28 min-w-[120px] rounded-md"
            />
          ))}
        </CardFooter>
      </Card>

      {shouldProcessFurther && (
        <Card className="flex h-full flex-col overflow-hidden shadow-sm">
          <CardHeader className="space-y-3">
            <div className="space-y-1">
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-4 w-72" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-3 text-sm">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full rounded-md" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
