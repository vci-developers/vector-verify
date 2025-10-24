import { Skeleton } from '@/shared/ui/skeleton';

export function SpecimenGridLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="rounded border p-2">
            <Skeleton className="mb-1 h-3 w-24" />
            <Skeleton className="aspect-[4/3] w-full rounded" />
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded" />
          <Skeleton className="h-9 w-9 rounded" />
          <Skeleton className="h-9 w-9 rounded" />
          <Skeleton className="h-9 w-9 rounded" />
          <Skeleton className="h-9 w-9 rounded" />
          <Skeleton className="h-9 w-9 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SpecimenAccordionLoadingSkeleton() {
  return (
    <div className="w-full rounded-lg border">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="border-b p-4 last:border-b-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
