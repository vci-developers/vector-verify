import { Card, CardContent, CardHeader } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';

export function AnnotationTasksListLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-[140px] rounded-md" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="w-[28%] px-4 py-3 text-center">
                  <Skeleton className="mx-auto h-3 w-24" />
                </TableHead>
                <TableHead className="w-[14%] px-4 py-3 text-center">
                  <Skeleton className="mx-auto h-3 w-20" />
                </TableHead>
                <TableHead className="w-[12%] px-4 py-3 text-center">
                  <Skeleton className="mx-auto h-3 w-20" />
                </TableHead>
                <TableHead className="w-[20%] px-4 py-3 text-center">
                  <Skeleton className="mx-auto h-3 w-24" />
                </TableHead>
                <TableHead className="w-[26%] px-4 py-3 text-center">
                  <Skeleton className="mx-auto h-3 w-24" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i} className="h-16">
                  <TableCell className="px-4 py-4 text-center align-middle">
                    <Skeleton className="mx-auto h-5 w-52" />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-center align-middle">
                    <Skeleton className="mx-auto h-6 w-20 rounded-md" />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-center align-middle">
                    <Skeleton className="mx-auto h-5 w-20" />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-center align-middle">
                    <Skeleton className="mx-auto h-5 w-40" />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-center align-middle">
                    <div className="mx-auto flex max-w-[280px] items-center justify-center gap-3">
                      <Skeleton className="h-2 w-full rounded-full" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
