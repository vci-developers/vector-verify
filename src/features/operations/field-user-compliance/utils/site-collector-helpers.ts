import type { Session } from '@/api/session/validation/session-schema';
import type { Site } from '@/api/site/validation/site-schema';
import type { ReportingSegment } from '@/features/operations/field-user-compliance/utils/reporting-segment-helpers';

interface SiteCollector {
    key: string;
    collectorName: string;
    collectorTitle: string;
    sessionCounts: number[];
}

function getCollectorKey(session: Session): string {
    return `${session.siteId}|${session.collectorName.trim()}|${session.collectorTitle.trim()}`;
}

export function buildSiteCollectors(
    siteId: number,
    segments: ReportingSegment[],
): SiteCollector[] {
    const collectorByKey = new Map<string, SiteCollector>();
    segments.forEach((segment, segmentIndex) => {
        for (const session of segment.sessionsBySiteId.get(siteId) ?? []) {
            const collectorKey = getCollectorKey(session);
            const collector = collectorByKey.get(collectorKey) ?? {
                key: collectorKey,
                collectorName: session.collectorName.trim(),
                collectorTitle: session.collectorTitle.trim(),
                sessionCounts: segments.map(() => 0),
            };
            collector.sessionCounts[segmentIndex] =
                (collector.sessionCounts[segmentIndex] ?? 0) + 1;
            collectorByKey.set(collectorKey, collector);
        }
    });
    return [...collectorByKey.values()].sort(
        (firstCollector, secondCollector) =>
            firstCollector.collectorName.localeCompare(
                secondCollector.collectorName,
            ),
    );
}

export function sumSessionCounts(sessionCounts: number[]): number {
    return sessionCounts.reduce(
        (total, sessionCount) => total + sessionCount,
        0,
    );
}

export function countCollectors(
    sites: Site[],
    segments: ReportingSegment[],
): number {
    const collectorKeys = new Set<string>();
    for (const segment of segments) {
        for (const site of sites) {
            for (const session of segment.sessionsBySiteId.get(site.siteId) ??
                []) {
                collectorKeys.add(getCollectorKey(session));
            }
        }
    }
    return collectorKeys.size;
}
