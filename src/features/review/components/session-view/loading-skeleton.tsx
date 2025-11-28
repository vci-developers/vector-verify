import React from 'react';
import { Skeleton } from '@/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';

export function SessionsAccordionSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-xl border shadow-sm">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-b px-4 py-3 last:border-b-0">
          <div className="flex items-center gap-4">
            <div className="bg-muted h-5 w-16 rounded" />
            <div className="bg-muted h-5 w-32 rounded" />
            <div className="bg-muted ml-auto h-4 w-24 rounded" />
          </div>
          <div className="mt-4">
            <div className="bg-card flex min-h-[400px] flex-col rounded-lg border p-4 shadow-sm">
              <div className="bg-muted mb-4 h-4 w-40 rounded" />
              <div className="flex flex-1 flex-col justify-center">
                <TableSkeleton fill />
              </div>
              <div className="mt-6 border-t pt-4">
                <div className="text-foreground mb-1 block text-sm font-medium">
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="bg-background h-16 w-full rounded border" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ fill }: { fill?: boolean }) {
  const numSpecies = 5;
  const numSexRows = 4;
  return (
    <div
      className={`w-full overflow-auto rounded-xl border shadow-sm ${
        fill ? 'flex flex-1 flex-col justify-center' : ''
      }`}
      style={fill ? { minHeight: 220 } : undefined}
    >
      <Table className="h-full min-w-[640px] text-sm">
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="sticky left-0 z-30 max-w-[10rem] border-r px-3">
              <Skeleton className="h-4 w-32" />
            </TableHead>
            {Array.from({ length: numSpecies }).map((_, i) => (
              <TableHead key={i} className="text-center">
                <Skeleton className="mx-auto h-4 w-20" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: numSexRows }).map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              <TableCell className="sticky left-0 z-20 max-w-[10rem] border-r align-top font-semibold">
                <Skeleton className="h-4 w-28" />
              </TableCell>
              {Array.from({ length: numSpecies }).map((_, colIdx) => (
                <TableCell key={colIdx} className="text-center">
                  <Skeleton className="mx-auto h-4 w-12" />
                </TableCell>
              ))}
            </TableRow>
          ))}
          {/* Total row */}
          <TableRow>
            <TableCell className="sticky left-0 z-20 max-w-[10rem] border-r align-top font-semibold">
              <Skeleton className="h-4 w-20" />
            </TableCell>
            {Array.from({ length: numSpecies }).map((_, colIdx) => (
              <TableCell key={colIdx} className="text-center font-semibold">
                <Skeleton className="mx-auto h-4 w-12" />
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
