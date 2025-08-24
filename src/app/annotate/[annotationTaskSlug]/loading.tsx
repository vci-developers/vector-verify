import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
      {/* Specimen viewer card */}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="py-1.5 px-6 pb-0">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-36" />
            <div className="flex items-center">
              <Skeleton className="h-4 w-4 rounded-full mr-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-28 mt-1" />
        </CardHeader>

        <CardContent className="p-2 px-6 pt-0.5 pb-0.5">
          {/* Image viewer */}
          <Skeleton className="h-[380px] w-full rounded-md" />

          {/* Zoom controls */}
          <div className="flex justify-center gap-2 mt-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </CardContent>

        <CardFooter className="border-t py-4.5 px-4">
          <div className="grid grid-cols-2 gap-y-9 px-3 w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>

      {/* Annotation form card */}
      <Card className="w-full max-w-md mx-auto flex flex-col max-h-[calc(100vh-2.5rem)]">
        <CardHeader className="py-1 px-6 flex-shrink-0">
          <Skeleton className="h-5 w-32 mb-1.5" />
          <div className="space-y-1">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </CardHeader>

        <CardContent className="px-6 pt-1 overflow-y-auto flex-grow">
          <div className="space-y-3">
            {/* Status section */}
            <div>
              <Skeleton className="h-4 w-32 mb-1.5" />
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-muted/50 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-7 w-7 rounded-md" />
                      <div className="w-full">
                        <Skeleton className="h-3 w-full mb-1" />
                        <Skeleton className="h-4 w-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dropdowns */}
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>

            {/* Notes */}
            <div>
              <Skeleton className="h-4 w-16 mb-1.5" />
              <Skeleton className="h-[80px] w-full rounded-md" />
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-10 rounded-md" />
              <Skeleton className="h-10 rounded-md" />
            </div>
          </div>
        </CardContent>

        <CardFooter className="py-4.5 px-4 flex-shrink-0">
          <div className="flex justify-between w-full items-center">
            <Skeleton className="h-8 w-24 rounded-md" />

            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-7" />
              <Skeleton className="h-5 w-6 rounded" />
              <Skeleton className="h-5 w-6 rounded" />
              <Skeleton className="h-3 w-20" />
            </div>

            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
