'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Site } from '@/api/site/validation/site-schema';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { getSiteDisplayName } from '@/lib/location/get-site-display-name';
import CollectorSheetContent from '@/features/operations/field-user-compliance/components/collector-sheet-content';
import type { ReportingSegment } from '@/features/operations/field-user-compliance/utils/reporting-segment-helpers';
import type { SiteCollector } from '@/features/operations/field-user-compliance/utils/site-collector-helpers';

interface CollectorSheetProps {
    site: Site;
    collector: SiteCollector;
    segments: ReportingSegment[];
}

export default function CollectorSheet({
    site,
    collector,
    segments,
}: CollectorSheetProps) {
    const t = useTranslations('OperationsFieldTeamPerformance');
    const tCommon = useTranslations('Common');
    const collectorName = collector.collectorName || t('unknownCollector');

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="link"
                    className="text-foreground h-auto p-0 text-sm font-normal"
                >
                    {collectorName}
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                showCloseButton={false}
                className="w-full gap-0 sm:max-w-xl"
            >
                <SheetHeader className="border-b pr-16">
                    <SheetTitle>{collectorName}</SheetTitle>
                    <SheetDescription>
                        {t('collectorSheetContext', {
                            collectorTitle: collector.collectorTitle,
                            siteName:
                                getSiteDisplayName(site) ||
                                t('unknownLocation'),
                            start: format(
                                parseISO(segments[0]!.startDate),
                                'MMM d',
                            ),
                            end: format(
                                parseISO(segments.at(-1)!.endDate),
                                'MMM d, yyyy',
                            ),
                        })}
                    </SheetDescription>
                </SheetHeader>
                <SheetClose asChild>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="absolute top-3 right-3"
                        aria-label={tCommon('close')}
                    >
                        <X className="size-4" aria-hidden="true" />
                    </Button>
                </SheetClose>
                <CollectorSheetContent
                    site={site}
                    collector={collector}
                    segments={segments}
                />
            </SheetContent>
        </Sheet>
    );
}
