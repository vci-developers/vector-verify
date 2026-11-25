'use client';

import { Fragment, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/utils/cn';
import ReportingSiteRow from '@/features/operations/field-user-compliance/components/reporting-site-row';
import {
    countReportingSites,
    getReportingLocationName,
    getReportingLocationParentName,
    isSegmentFullyReported,
    type ReportingLocation,
} from '@/features/operations/field-user-compliance/utils/site-reporting-helpers';
import type { ReportingSegment } from '@/features/operations/field-user-compliance/utils/reporting-segment-helpers';
import { countCollectors } from '@/features/operations/field-user-compliance/utils/site-collector-helpers';

function getReportingBadgeClass(
    reportingCount: number,
    totalCount: number,
): string {
    if (reportingCount === totalCount) return 'bg-success/15 text-success';
    if (reportingCount === 0) return 'bg-destructive/15 text-destructive';
    return 'bg-warning/15 text-warning';
}

interface ReportingLocationRowProps {
    location: ReportingLocation;
    segments: ReportingSegment[];
}

export default function ReportingLocationRow({
    location,
    segments,
}: ReportingLocationRowProps) {
    const t = useTranslations('OperationsFieldTeamPerformance');
    const [isExpanded, setIsExpanded] = useState(false);
    const reportingSiteCounts = segments.map(segment =>
        countReportingSites(location.sites, segment),
    );
    const fullyReportedSegmentCount = segments.filter(segment =>
        isSegmentFullyReported(location.sites, segment),
    ).length;
    const parentLocationName = getReportingLocationParentName(location);
    const collectorCountLabel = t('collectorCount', {
        count: countCollectors(location.sites, segments),
    });

    return (
        <Fragment>
            <TableRow
                className="group cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
            >
                <TableCell className="bg-card group-hover:from-muted/50 group-hover:to-muted/50 sticky left-0 z-10 px-4 py-3 group-hover:bg-linear-to-r">
                    <div className="flex items-center gap-2">
                        <ChevronRight
                            className={cn(
                                'text-muted-foreground h-4 w-4 shrink-0 transition-transform',
                                isExpanded && 'rotate-90',
                            )}
                        />
                        <span className="text-sm font-medium">
                            {getReportingLocationName(location) ||
                                t('unknownLocation')}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            {[parentLocationName, collectorCountLabel]
                                .filter(Boolean)
                                .join(' · ')}
                        </span>
                    </div>
                </TableCell>
                {segments.map((segment, index) => (
                    <TableCell
                        key={segment.key}
                        className="px-3 py-3 text-center"
                    >
                        <Badge
                            variant="outline"
                            className={cn(
                                'border-transparent tabular-nums',
                                getReportingBadgeClass(
                                    reportingSiteCounts[index]!,
                                    location.sites.length,
                                ),
                            )}
                        >
                            {reportingSiteCounts[index]}/{location.sites.length}
                        </Badge>
                    </TableCell>
                ))}
                <TableCell className="bg-card group-hover:from-muted/50 group-hover:to-muted/50 sticky right-0 z-10 px-4 py-3 text-center font-medium tabular-nums group-hover:bg-linear-to-r">
                    {t('countOfTotal', {
                        count: fullyReportedSegmentCount,
                        total: segments.length,
                    })}
                </TableCell>
            </TableRow>
            {isExpanded &&
                location.sites.map(site => (
                    <ReportingSiteRow
                        key={site.siteId}
                        site={site}
                        segments={segments}
                    />
                ))}
        </Fragment>
    );
}
