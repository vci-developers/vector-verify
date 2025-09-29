'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import type { MonthlySummary } from '@/lib/review/types';

interface ReviewTableProps {
  summaries: MonthlySummary[];
  onReview: (district: string, month: string) => void;
}

export function ReviewTable({ summaries, onReview }: ReviewTableProps) {
  const router = useRouter();

  const handleReview = (district: string, month: string) => {
    // Navigate to detailed review page
    router.push(`/review/${district}/${month}`);
  };

  if (summaries.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          No review data found for the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">District / Month</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">KPIs</TableHead>
            <TableHead className="font-semibold">Last Updated</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaries.map((summary, index) => (
            <TableRow
              key={`${summary.district}-${summary.month}-${index}`}
              className="hover:bg-muted/50"
            >
              <TableCell className="font-medium">
                <div>
                  <div className="text-foreground font-semibold">
                    {summary.district}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {summary.month}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {summary.status || 'Pending'}
                </Badge>
              </TableCell>

              <TableCell>
                <div className="space-y-1 text-sm">
                  <div>Sessions: {summary.totalSessions}</div>
                  <div>Specimens: {summary.totalSpecimens}</div>
                  <div
                    className={
                      (summary.discrepancies || 0) > 0
                        ? 'text-destructive'
                        : 'text-green-600'
                    }
                  >
                    Discrepancies: {summary.discrepancies || 0}
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <span className="text-muted-foreground text-sm">
                  {summary.lastUpdated || 'N/A'}
                </span>
              </TableCell>

              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReview(summary.district, summary.month)}
                  className="text-primary hover:text-primary/80 h-auto p-0 font-normal"
                >
                  Review
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
