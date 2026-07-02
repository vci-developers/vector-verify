import type { Session } from '@/api/session/validation/session-schema';
import { differenceInCalendarMonths } from 'date-fns';

const LAPSING_MAX_MONTHS = 2;
const INACTIVE_MAX_MONTHS = 5;

type DeviceStatus = 'active' | 'lapsing' | 'inactive';

export interface SiteDeviceActivity {
    siteId: number;
    activeDeviceCountAtSite: number;
    lapsingDeviceCountAtSite: number;
    inactiveDeviceCountAtSite: number;
}

export interface DeviceActivity {
    activeDeviceCount: number;
    lapsingDeviceCount: number;
    inactiveDeviceCount: number;
    totalDeviceCount: number;
    sites: SiteDeviceActivity[];
}

export function buildDeviceActivity(sessions: Session[]): DeviceActivity {
    const now = new Date();

    const latestSessionByDevice = new Map<
        number,
        { siteId: number; submittedAt: number }
    >();
    for (const session of sessions) {
        const latestSession = latestSessionByDevice.get(session.deviceId);
        if (
            latestSession === undefined ||
            session.submittedAt > latestSession.submittedAt
        ) {
            latestSessionByDevice.set(session.deviceId, {
                siteId: session.siteId,
                submittedAt: session.submittedAt,
            });
        }
    }

    const activityBySite = new Map<number, SiteDeviceActivity>();
    let activeDeviceCount = 0;
    let lapsingDeviceCount = 0;
    let inactiveDeviceCount = 0;

    for (const { siteId, submittedAt } of latestSessionByDevice.values()) {
        const status = deviceStatusFromLatestSession(submittedAt, now);
        if (status === null) continue;

        let siteActivity = activityBySite.get(siteId);
        if (!siteActivity) {
            siteActivity = {
                siteId,
                activeDeviceCountAtSite: 0,
                lapsingDeviceCountAtSite: 0,
                inactiveDeviceCountAtSite: 0,
            };
            activityBySite.set(siteId, siteActivity);
        }

        if (status === 'active') {
            activeDeviceCount++;
            siteActivity.activeDeviceCountAtSite++;
        } else if (status === 'lapsing') {
            lapsingDeviceCount++;
            siteActivity.lapsingDeviceCountAtSite++;
        } else {
            inactiveDeviceCount++;
            siteActivity.inactiveDeviceCountAtSite++;
        }
    }

    return {
        activeDeviceCount,
        lapsingDeviceCount,
        inactiveDeviceCount,
        totalDeviceCount:
            activeDeviceCount + lapsingDeviceCount + inactiveDeviceCount,
        sites: [...activityBySite.values()],
    };
}

function deviceStatusFromLatestSession(
    latestSession: number,
    now: Date,
): DeviceStatus | null {
    const monthsSinceLastSession = differenceInCalendarMonths(
        now,
        latestSession,
    );
    if (monthsSinceLastSession > INACTIVE_MAX_MONTHS) return null;
    if (monthsSinceLastSession <= 0) return 'active';
    if (monthsSinceLastSession <= LAPSING_MAX_MONTHS) return 'lapsing';
    return 'inactive';
}
