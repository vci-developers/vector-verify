'use client';

import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import type { Site } from '@/api/site/validation/site-schema';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import ErrorBanner from '@/components/ui/error-banner';
import ReportingLocationRow from '@/features/operations/field-user-compliance/components/reporting-location-row';
import { useSiteReportingGrid } from '@/features/operations/field-user-compliance/hooks/use-site-reporting-grid';
import {
    getHierarchicalLevelNames,
    getReportingLocationKey,
    getSiteReportingStats,
} from '@/features/operations/field-user-compliance/utils/site-reporting-helpers';
import type { ReportingSegment } from '@/features/operations/field-user-compliance/utils/reporting-segment-helpers';

interface OperationsFieldUserComplianceProps {
    programId: number;
    descendantsOfSelectedLocations: Site[];
    startDate: string;
    endDate: string;
}

export default function OperationsFieldUserCompliance({
    programId,
    descendantsOfSelectedLocations,
    startDate,
    endDate,
}: OperationsFieldUserComplianceProps) {
    const t = useTranslations('OperationsFieldTeamPerformance');
    const tCollectionCycle = useTranslations('CollectionCycle');
    const { locations, segments, isPending, isError } = useSiteReportingGrid({
        programId,
        sites: descendantsOfSelectedLocations,
        startDate,
        endDate,
    });

    function getCycleDateRange(segment: ReportingSegment): string {
        return t('cycleDateRange', {
            start: format(parseISO(segment.startDate), 'MMM d'),
            end: format(parseISO(segment.endDate), 'MMM d'),
        });
    }

    function getSegmentLabel(segment: ReportingSegment): string {
        return segment.kind === 'cycle'
            ? tCollectionCycle('badgeLabel', {
                  cycleNumber: segment.cycleNumber,
              })
            : format(parseISO(segment.startDate), 'MMM yy');
    }

    if (isPending) {
        return <Skeleton className="h-125 w-full rounded-md" />;
    }

    if (isError) {
        return (
            <div className="space-y-3">
                <ErrorBanner message={t('reportingError')} />
                <Skeleton
                    className="h-125 w-full rounded-md"
                    variant="destructive"
                />
            </div>
        );
    }

    if (locations.length === 0 || !segments) {
        return (
            <div className="text-muted-foreground flex h-125 items-center justify-center text-sm">
                {t('noActiveSites')}
            </div>
        );
    }

    const stats = getSiteReportingStats(locations, segments);
    const allSites = locations.flatMap(location => location.sites);
    const hierarchicalLevelNames = getHierarchicalLevelNames(allSites);
    const locationLevelName =
        hierarchicalLevelNames?.locationLevelName ?? t('village');
    const siteLevelName = hierarchicalLevelNames?.siteLevelName ?? t('house');
    const segmentKind = segments[0]!.kind;

    const statCards = [
        {
            key: 'fullyReporting',
            label: t('fullyReporting'),
            value: t('countOfTotal', {
                count: stats.fullyReportingLocationCount,
                total: locations.length,
            }),
        },
        {
            key: 'sitesReporting',
            label: t('sitesReporting'),
            value: t('countOfTotal', {
                count: stats.reportingSiteCount,
                total: allSites.length,
            }),
        },
        {
            key: 'segmentsFullyReported',
            label: t('fullyReportedSegments', { kind: segmentKind }),
            value: t('countOfTotal', {
                count: stats.fullyReportedSegmentCount,
                total: segments.length,
            }),
        },
        {
            key: 'collectorsReporting',
            label: t('collectorsReporting'),
            value: stats.collectorCount,
        },
    ];

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap justify-end gap-3">
                {statCards.map(statCard => (
                    <Card key={statCard.key} className="border-border/50 w-fit">
                        <CardContent className="flex items-center gap-3 px-4">
                            <p className="text-muted-foreground text-xs">
                                {statCard.label}
                            </p>
                            <p className="text-lg leading-none font-bold">
                                {statCard.value}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-border/50 p-0">
                <CardContent className="px-4 py-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="bg-card sticky left-0 z-10 px-4 py-3">
                                    {t('locationColumn', {
                                        locationLevel: locationLevelName,
                                        siteLevel: siteLevelName,
                                    })}
                                </TableHead>
                                {segments.map(segment => (
                                    <TableHead
                                        key={segment.key}
                                        className="px-3 py-3 text-center"
                                    >
                                        <p>{getSegmentLabel(segment)}</p>
                                        {segment.kind === 'cycle' && (
                                            <p className="text-muted-foreground text-xs font-normal">
                                                {getCycleDateRange(segment)}
                                            </p>
                                        )}
                                    </TableHead>
                                ))}
                                <TableHead className="bg-card sticky right-0 z-10 px-4 py-3 text-center">
                                    {t('fullyReportedSegments', {
                                        kind: segmentKind,
                                    })}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {locations.map(location => (
                                <ReportingLocationRow
                                    key={getReportingLocationKey(location)}
                                    location={location}
                                    segments={segments}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
