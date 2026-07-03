import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import type { Session } from '@/api/session/validation/session-schema';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';

const RECENT_PERIOD_COUNT = 3;

export interface DeviceActivityWindow {
    startDate: string;
    endDate: string;
    currentCycleId: number | null;
}

function resolveCurrentCycle(
    collectionCycles: CollectionCycle[],
    currentDate: number,
): CollectionCycle | null {
    return (
        collectionCycles.find(
            cycle =>
                cycle.startDate <= currentDate && currentDate < cycle.endDate,
        ) ??
        collectionCycles
            .filter(cycle => cycle.startDate <= currentDate)
            .sort(
                (firstCycle, secondCycle) =>
                    secondCycle.startDate - firstCycle.startDate,
            )[0] ??
        null
    );
}

export function resolveDeviceActivityWindow(
    collectionCycles: CollectionCycle[],
    currentDate: number,
): DeviceActivityWindow {
    const currentCycle = resolveCurrentCycle(collectionCycles, currentDate);
    if (currentCycle === null) return resolveMonthWindow(currentDate);

    const recentCycles = collectionCycles
        .filter(cycle => cycle.startDate <= currentCycle.startDate)
        .sort(
            (firstCycle, secondCycle) =>
                secondCycle.startDate - firstCycle.startDate,
        )
        .slice(0, RECENT_PERIOD_COUNT);
    const earliestRecentCycle =
        recentCycles[recentCycles.length - 1] ?? currentCycle;

    return {
        startDate: formatDateInTimezone(
            earliestRecentCycle.startDate,
            earliestRecentCycle.timezone,
            'yyyy-MM-dd',
        ),
        endDate: formatDateInTimezone(
            currentCycle.endDate,
            currentCycle.timezone,
            'yyyy-MM-dd',
        ),
        currentCycleId: currentCycle.id,
    };
}

function resolveMonthWindow(currentDate: number): DeviceActivityWindow {
    return {
        startDate: format(
            startOfMonth(subMonths(currentDate, RECENT_PERIOD_COUNT - 1)),
            'yyyy-MM-dd',
        ),
        endDate: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
        currentCycleId: null,
    };
}

export interface SiteDeviceActivity {
    siteId: number;
    activeDeviceCountAtSite: number;
    inactiveDeviceCountAtSite: number;
}

export interface DeviceActivity {
    activeDeviceCount: number;
    inactiveDeviceCount: number;
    totalDeviceCount: number;
    sites: SiteDeviceActivity[];
}

export function buildDeviceActivity(
    sessions: Session[],
    currentCycleId: number | null,
    currentDate: number,
): DeviceActivity {
    const currentMonthKey = formatDateInTimezone(currentDate, 'UTC', 'yyyy-MM');
    const isSessionInCurrentCycle = (session: Session): boolean =>
        currentCycleId !== null
            ? session.collectionCycleId === currentCycleId
            : formatDateInTimezone(session.collectionDate, 'UTC', 'yyyy-MM') ===
              currentMonthKey;

    const summaryByDeviceId = new Map<
        number,
        {
            latestSiteId: number;
            latestCollectionDate: number;
            isActive: boolean;
        }
    >();
    for (const session of sessions) {
        const deviceActivitySummary = summaryByDeviceId.get(session.deviceId);
        if (deviceActivitySummary === undefined) {
            summaryByDeviceId.set(session.deviceId, {
                latestSiteId: session.siteId,
                latestCollectionDate: session.collectionDate,
                isActive: isSessionInCurrentCycle(session),
            });
            continue;
        }
        if (
            session.collectionDate > deviceActivitySummary.latestCollectionDate
        ) {
            deviceActivitySummary.latestSiteId = session.siteId;
            deviceActivitySummary.latestCollectionDate = session.collectionDate;
        }
        deviceActivitySummary.isActive ||= isSessionInCurrentCycle(session);
    }

    const activityBySite = new Map<number, SiteDeviceActivity>();
    let activeDeviceCount = 0;
    let inactiveDeviceCount = 0;

    for (const deviceActivitySummary of summaryByDeviceId.values()) {
        let siteActivity = activityBySite.get(
            deviceActivitySummary.latestSiteId,
        );
        if (!siteActivity) {
            siteActivity = {
                siteId: deviceActivitySummary.latestSiteId,
                activeDeviceCountAtSite: 0,
                inactiveDeviceCountAtSite: 0,
            };
            activityBySite.set(
                deviceActivitySummary.latestSiteId,
                siteActivity,
            );
        }

        if (deviceActivitySummary.isActive) {
            activeDeviceCount++;
            siteActivity.activeDeviceCountAtSite++;
        } else {
            inactiveDeviceCount++;
            siteActivity.inactiveDeviceCountAtSite++;
        }
    }

    return {
        activeDeviceCount,
        inactiveDeviceCount,
        totalDeviceCount: activeDeviceCount + inactiveDeviceCount,
        sites: [...activityBySite.values()],
    };
}
