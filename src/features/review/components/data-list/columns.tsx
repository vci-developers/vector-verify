import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/ui/button';
import { ArrowRight, BarChart3 } from 'lucide-react';
import type { MonthlySummary } from '@/features/review/types';

interface CreateColumnsParams {
  onNavigateToReview: (district: string, monthYear: string) => void;
  onNavigateToDashboard: (district: string, monthYear: string) => void;
}

export function createMonthlySummaryColumns({
  onNavigateToReview,
  onNavigateToDashboard,
}: CreateColumnsParams): ColumnDef<MonthlySummary>[] {
  return [
    {
      id: 'district',
      accessorKey: 'district',
      header: 'District / Month',
      cell: ({ row }) => {
        const summary = row.original;
        return (
          <div className="text-center">
            <div className="text-foreground font-semibold">
              {summary.district}
            </div>
            <div className="text-muted-foreground text-sm">
              {summary.monthName}
            </div>
          </div>
        );
      },
    },
    {
      id: 'sessionCount',
      accessorKey: 'sessionCount',
      header: 'Sessions',
      cell: ({ row }) => {
        const summary = row.original;
        return (
          <div className="text-center">
            <div className="text-foreground font-semibold">
              {summary.sessionCount}
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const summary = row.original;
        return (
          <div className="flex justify-center space-x-2">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onNavigateToDashboard(summary.district, summary.monthString)
              }
              className="h-auto p-0 font-normal text-blue-600 hover:text-blue-800"
            >
              <BarChart3 className="mr-1 h-3 w-3" />
              Dashboard
            </Button>
          </div>
        );
      },
    },
  ];
}
