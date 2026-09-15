'use client';

import { useGetPrograms } from '@/api/program/hooks/use-get-programs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import AnalyticsTab from '@/components/user-analytics/analytics-tab';
import ReportTab from '@/components/user-analytics/report-tab';

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
            <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {programName
                            ? t('programDescription', { programName })
                            : t('description')}
                    </DialogDescription>
                </DialogHeader>

                <Tabs
                    defaultValue="analytics"
                    className="flex min-h-0 flex-1 flex-col gap-4"
                >
                    <TabsList>
                        <TabsTrigger value="analytics">
                            {t('analyticsTab')}
                        </TabsTrigger>
                        <TabsTrigger value="report">
                            {t('reportTab')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="analytics" className="flex min-h-0">
                        <AnalyticsTab open={open} programId={programId} />
                    </TabsContent>

                    <TabsContent value="report" className="flex min-h-0">
                        <ReportTab open={open} programId={programId} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
