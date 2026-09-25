'use client';

import { useGetPrograms } from '@/api/program/hooks/use-get-programs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import UserAnalyticsPanel from '@/components/user-analytics/user-analytics-panel';

interface UserAnalyticsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    programId: number;
}

export default function UserAnalyticsDialog({
    open,
    onOpenChange,
    programId,
}: UserAnalyticsDialogProps) {
    const t = useTranslations('UserAnalytics');

    const { data: getProgramsResult } = useGetPrograms();
    const programName = getProgramsResult?.ok
        ? getProgramsResult.data.programs.find(
              program => program.programId === programId,
          )?.name
        : undefined;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col p-10 sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {programName
                            ? t('programDescription', { programName })
                            : t('description')}
                    </DialogDescription>
                </DialogHeader>

                <UserAnalyticsPanel programId={programId} />
            </DialogContent>
        </Dialog>
    );
}
