'use client';

import { Fragment, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import type { Site } from '@/api/site/validation/site-schema';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/utils/cn';
import { getSiteDisplayName } from '@/lib/location/get-site-display-name';
import {
    buildSiteCollectors,
    sumSessionCounts,
} from '@/features/operations/field-user-compliance/utils/site-collector-helpers';
import type { ReportingSegment } from '@/features/operations/field-user-compliance/utils/reporting-segment-helpers';

interface ReportingSiteRowProps {
    site: Site;
    segments: ReportingSegment[];
}

export default function ReportingSiteRow({
    site,
    segments,
}: ReportingSiteRowProps) {
    const t = useTranslations('OperationsFieldTeamPerformance');
    const [isExpanded, setIsExpanded] = useState(false);
    const collectors = buildSiteCollectors(site.siteId, segments);
    const hasCollectors = collectors.length > 0;
    const reportingSegmentCount = segments.filter(segment =>
        segment.sessionsBySiteId.has(site.siteId),
    ).length;

    return (
        <Fragment>
            <TableRow
                className={cn('group', hasCollectors && 'cursor-pointer')}
                onClick={
                    hasCollectors ? () => setIsExpanded(!isExpanded) : undefined
                }
                aria-expanded={hasCollectors ? isExpanded : undefined}
            >
                <TableCell className="bg-card group-hover:from-muted/50 group-hover:to-muted/50 sticky left-0 z-10 py-3 pr-4 pl-10 group-hover:bg-linear-to-r">
                    <div className="flex items-center gap-2">
                        <ChevronRight
                            className={cn(
                                'text-muted-foreground h-4 w-4 shrink-0 transition-transform',
                                isExpanded && 'rotate-90',
                                !hasCollectors && 'invisible',
                            )}
                        />
                        <span className="text-muted-foreground text-sm">
                            {getSiteDisplayName(site) || t('unknownLocation')}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            {t('collectorCount', { count: collectors.length })}
                        </span>
                    </div>
                </TableCell>
                {segments.map(segment => (
                    <TableCell
                        key={segment.key}
                        className="px-3 py-3 text-center"
                    >
                        <span
                            className={cn(
                                'inline-block h-3 w-3 rounded-full',
                                segment.sessionsBySiteId.has(site.siteId)
                                    ? 'bg-success'
                                    : 'border-destructive border-2',
                            )}
                            aria-label={
                                segment.sessionsBySiteId.has(site.siteId)
                                    ? t('sessionsReported')
                                    : t('nothingReported')
                            }
                        />
                    </TableCell>
                ))}
                <TableCell className="bg-card group-hover:from-muted/50 group-hover:to-muted/50 sticky right-0 z-10 px-4 py-3 text-center tabular-nums group-hover:bg-linear-to-r">
                    {t('countOfTotal', {
                        count: reportingSegmentCount,
                        total: segments.length,
                    })}
                </TableCell>
            </TableRow>
            {isExpanded &&
                collectors.map(collector => (
                    <TableRow key={collector.key} className="group">
                        <TableCell className="bg-card group-hover:from-muted/50 group-hover:to-muted/50 sticky left-0 z-10 py-3 pr-4 pl-20 text-sm group-hover:bg-linear-to-r">
                            {collector.collectorName || t('unknownCollector')}
                            <span className="text-muted-foreground ml-2 text-xs">
                                {collector.collectorTitle}
                            </span>
                        </TableCell>
                        {collector.sessionCounts.map((sessionCount, index) => (
                            <TableCell
                                key={segments[index]!.key}
                                className="text-muted-foreground px-3 py-3 text-center text-sm tabular-nums"
                            >
                                {sessionCount || '–'}
                            </TableCell>
                        ))}
                        <TableCell className="bg-card group-hover:from-muted/50 group-hover:to-muted/50 text-muted-foreground sticky right-0 z-10 px-4 py-3 text-center text-sm tabular-nums group-hover:bg-linear-to-r">
                            {t('sessionCount', {
                                count: sumSessionCounts(
                                    collector.sessionCounts,
                                ),
                            })}
                        </TableCell>
                    </TableRow>
                ))}
        </Fragment>
    );
}
