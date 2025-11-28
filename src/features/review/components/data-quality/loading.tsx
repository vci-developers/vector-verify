import { Skeleton } from '@/shared/ui/skeleton';

export function DataQualityLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-12">
      <header className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-96" />
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}
