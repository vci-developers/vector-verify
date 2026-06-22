import type { Session } from '@/api/session/validation/session-schema';
import { differenceInCalendarMonths } from 'date-fns';

const LAPSING_MAX_MONTHS = 2;
const INACTIVE_MAX_MONTHS = 5;

type DeviceStatus = 'active' | 'lapsing' | 'inactive';

export interface SiteDeviceActivity {
    siteId: number;
    activeDeviceCountAtSite: number;
    lapsingDeviceCountAtSite: number;
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

    const latestSessionBySiteDevice = new Map<number, Map<number, number>>();
    for (const session of sessions) {
        let latestSessionByDevice = latestSessionBySiteDevice.get(
            session.siteId,
        );
        if (!latestSessionByDevice) {
            latestSessionByDevice = new Map();
            latestSessionBySiteDevice.set(
                session.siteId,
                latestSessionByDevice,
            );
        }
        recordLatestSession(
            latestSessionByDevice,
            session.deviceId,
            session.submittedAt,
        );
    }

    const latestSessionByDevice = new Map<number, number>();
    for (const sessionsByDevice of latestSessionBySiteDevice.values()) {
        for (const [deviceId, submittedAt] of sessionsByDevice) {
            recordLatestSession(latestSessionByDevice, deviceId, submittedAt);
        }
    }

    const deviceStatuses = [...latestSessionByDevice.values()].map(
        latestSession => deviceStatusFromLatestSession(latestSession, now),
    );

    return {
        activeDeviceCount: deviceStatuses.filter(status => status === 'active')
            .length,
        lapsingDeviceCount: deviceStatuses.filter(
            status => status === 'lapsing',
        ).length,
        inactiveDeviceCount: deviceStatuses.filter(
            status => status === 'inactive',
        ).length,
        totalDeviceCount: deviceStatuses.filter(status => status !== null)
            .length,
        sites: [...latestSessionBySiteDevice].map(
            ([siteId, sessionsByDevice]) => {
                const deviceStatusesAtSite = [...sessionsByDevice.values()].map(
                    latestSession =>
                        deviceStatusFromLatestSession(latestSession, now),
                );
                return {
                    siteId,
                    activeDeviceCountAtSite: deviceStatusesAtSite.filter(
                        status => status === 'active',
                    ).length,
                    lapsingDeviceCountAtSite: deviceStatusesAtSite.filter(
                        status => status === 'lapsing',
                    ).length,
                };
            },
        ),
    };
}

function recordLatestSession(
    latestSessionByDevice: Map<number, number>,
    deviceId: number,
    submittedAt: number,
): void {
    const latestSession = latestSessionByDevice.get(deviceId);
    if (latestSession === undefined || submittedAt > latestSession) {
        latestSessionByDevice.set(deviceId, submittedAt);
    }
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
