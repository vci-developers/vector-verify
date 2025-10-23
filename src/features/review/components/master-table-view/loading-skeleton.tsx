import { Skeleton } from '@/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';

export function MasterTableViewLoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <header className="flex items-end justify-between gap-4 border-b pb-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-32" />
      </header>

      <section className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="overflow-auto rounded-xl border shadow-sm">
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="sticky left-0 min-w-[240px]" rowSpan={2}>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {[...Array(3)].map((_, i) => (
                  <TableHead key={i} className="text-center" colSpan={3}>
                    <Skeleton className="mx-auto h-4 w-24" />
                  </TableHead>
                ))}
              </TableRow>
              <TableRow className="bg-muted">
                {[...Array(9)].map((_, i) => (
                  <TableHead
                    key={i}
                    className="sticky top-[2.5rem] text-center"
                  >
                    <Skeleton className="mx-auto h-4 w-16" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(6)].map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="sticky left-0">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  {[...Array(9)].map((_, colIndex) => (
                    <TableCell key={colIndex} className="text-center">
                      <Skeleton className="mx-auto h-4 w-8" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
