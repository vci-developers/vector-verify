import { Button } from '@/ui/button';
import { Dhis2SyncDialog } from '@/features/review/components/review-dashboard/dhis2-sync-dialog';
import type { VillageIrsFormData } from '@/features/review/types/dhis2-sync';

interface DashboardHeaderProps {
  district: string;
  monthName: string;
  canSync: boolean;
  isSyncing: boolean;
  onSyncButtonClick: () => void;
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  villages: string[];
  onSyncSubmit: (villageData: VillageIrsFormData[]) => void;
}

export function DashboardHeader({
  district,
  monthName,
  canSync,
  isSyncing,
  onSyncButtonClick,
  dialogOpen,
  onDialogOpenChange,
  villages,
  onSyncSubmit,
}: DashboardHeaderProps) {
  return (
    <>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">{district}</h1>
          <p className="mt-2 text-lg text-gray-600">{monthName}</p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <Button
            className="bg-chart-green-medium hover:bg-chart-green-dark focus-visible:border-chart-green-medium focus-visible:ring-chart-green-medium/40 text-white shadow-xs"
            onClick={onSyncButtonClick}
            disabled={isSyncing || !canSync}
          >
            {isSyncing ? 'Syncing with DHIS2…' : 'Sync to DHIS2'}
          </Button>
          {!canSync && (
            <p className="text-muted-foreground text-xs md:text-right">
              You do not have permission to push metadata.
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 h-px bg-gray-200"></div>

      <Dhis2SyncDialog
        open={dialogOpen}
        onOpenChange={onDialogOpenChange}
        villages={villages}
        onSubmit={onSyncSubmit}
        isSubmitting={isSyncing}
      />
    </>
  );
}

