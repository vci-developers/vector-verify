import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

export function ReviewDataListLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-[140px] rounded-md" />
            <Skeleton className="h-9 w-[140px] rounded-md" />
            <Skeleton className="h-9 w-[100px] rounded-md" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="w-[40%] px-4 py-3 text-center">
                  <Skeleton className="mx-auto h-3 w-32" />
                </TableHead>
                <TableHead className="w-[30%] px-4 py-3 text-center">
                  <Skeleton className="mx-auto h-3 w-20" />
                </TableHead>
                <TableHead className="w-[30%] px-4 py-3 text-center">
                  <Skeleton className="mx-auto h-3 w-16" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i} className="h-16">
                  <TableCell className="px-4 py-4 text-center align-middle">
                    <div className="space-y-2">
                      <Skeleton className="mx-auto h-4 w-24" />
                      <Skeleton className="mx-auto h-3 w-16" />
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-center align-middle">
                    <Skeleton className="mx-auto h-6 w-20 rounded-md" />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-center align-middle">
                    <Skeleton className="mx-auto h-8 w-16" />
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
