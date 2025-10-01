'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { MonthlySummary } from '@/lib/review/types';

interface ReviewTableProps {
  summaries: MonthlySummary[];
  onNavigateToReview: (district: string, month: string) => void;
  isEmpty?: boolean;
}

export function ReviewTable({
  summaries,
  onNavigateToReview,
  isEmpty = false,
}: ReviewTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/60">
          <TableHead className="text-muted-foreground w-[35%] px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
            District / Month
          </TableHead>
          <TableHead className="text-muted-foreground w-[30%] px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
            Sessions
          </TableHead>
          <TableHead className="text-muted-foreground w-[35%] px-4 py-3 text-center text-xs font-semibold tracking-wide uppercase">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isEmpty ? (
          <TableRow>
            <TableCell
              colSpan={3}
              className="text-muted-foreground px-3 py-6 text-center"
            >
              No review data found for the selected filters.
            </TableCell>
          </TableRow>
        ) : (
          summaries.map((summary, index) => (
            <TableRow
              key={`${summary.district}-${summary.monthString}-${index}`}
              className="hover:bg-muted/50"
            >
              <TableCell className="px-4 py-4 text-center align-middle font-medium">
                <div>
                  <div className="text-foreground font-semibold">
                    {summary.district}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {summary.monthName}
                  </div>
                </div>
              </TableCell>

              <TableCell className="px-4 py-4 text-center align-middle">
                <div className="text-foreground font-semibold">
                  {summary.sessionCount}
                </div>
              </TableCell>

              <TableCell className="px-4 py-4 text-center align-middle">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onNavigateToReview(summary.district, summary.monthString)
                  }
                  className="text-primary hover:text-primary/80 h-auto p-0 font-normal"
                >
                  Review
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
