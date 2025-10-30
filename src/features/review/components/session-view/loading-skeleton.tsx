import React from "react";
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
    <div className="w-full border rounded-xl shadow-sm animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-b last:border-b-0 px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="h-5 w-16 bg-muted rounded" />
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded ml-auto" />
          </div>
          <div className="mt-4">
            <div className="rounded-lg border bg-card p-4 shadow-sm min-h-[400px] flex flex-col">
              <div className="h-4 w-40 bg-muted rounded mb-4" />
              <div className="flex-1 flex flex-col justify-center">
                <TableSkeleton fill />
              </div>
              <div className="border-t mt-6 pt-4">
                <div className="block text-sm font-medium mb-1 text-foreground">
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="w-full h-16 rounded border bg-background" />
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
      className={`overflow-auto rounded-xl border shadow-sm w-full ${
        fill ? "flex-1 flex flex-col justify-center" : ""
      }`}
      style={fill ? { minHeight: 220 } : undefined}
    >
      <Table className="text-sm min-w-[640px] h-full">
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