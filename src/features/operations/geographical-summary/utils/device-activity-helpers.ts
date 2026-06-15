import type { Session } from '@/api/session/validation/session-schema';
import { differenceInCalendarMonths } from 'date-fns';

const LAPSING_MAX_MONTHS = 2;
const INACTIVE_MAX_MONTHS = 5;

type DeviceStatus = 'active' | 'lapsing' | 'inactive';

interface SiteActivity {
    latestSubmissionByDevice: Map<number, number>;
}

export interface SiteDeviceActivity {
    siteId: number;
    activeDeviceCount: number;
    lapsingDeviceCount: number;
}

export interface DeviceActivity {
    activeDevices: number;
    lapsingDevices: number;
    inactiveDevices: number;
    totalDevices: number;
    sites: SiteDeviceActivity[];
}

export function buildDeviceActivity(sessions: Session[]): DeviceActivity {
    const now = new Date();

    const siteActivityBySiteId = new Map<number, SiteActivity>();
    for (const session of sessions) {
        let siteActivity = siteActivityBySiteId.get(session.siteId);
        if (!siteActivity) {
            siteActivity = { latestSubmissionByDevice: new Map() };
            siteActivityBySiteId.set(session.siteId, siteActivity);
        }
        recordLatestSubmission(
            siteActivity.latestSubmissionByDevice,
            session.deviceId,
            session.submittedAt,
        );
    }

    const latestSubmissionByDevice = new Map<number, number>();
    for (const siteActivity of siteActivityBySiteId.values()) {
        for (const [
            deviceId,
            submittedAt,
        ] of siteActivity.latestSubmissionByDevice) {
            recordLatestSubmission(
                latestSubmissionByDevice,
                deviceId,
                submittedAt,
            );
        }
    }

    const deviceStatuses = [...latestSubmissionByDevice.values()].map(
        latestSubmission =>
            deviceStatusFromLatestSubmission(latestSubmission, now),
    );

    return {
        activeDevices: deviceStatuses.filter(status => status === 'active')
            .length,
        lapsingDevices: deviceStatuses.filter(status => status === 'lapsing')
            .length,
        inactiveDevices: deviceStatuses.filter(status => status === 'inactive')
            .length,
        totalDevices: deviceStatuses.filter(status => status !== null).length,
        sites: [...siteActivityBySiteId].map(([siteId, siteActivity]) => {
            const deviceStatusesAtSite = [
                ...siteActivity.latestSubmissionByDevice.values(),
            ].map(latestSubmission =>
                deviceStatusFromLatestSubmission(latestSubmission, now),
            );
            return {
                siteId,
                activeDeviceCount: deviceStatusesAtSite.filter(
                    status => status === 'active',
                ).length,
                lapsingDeviceCount: deviceStatusesAtSite.filter(
                    status => status === 'lapsing',
                ).length,
            };
        }),
    };
}

function recordLatestSubmission(
    latestSubmissionByDevice: Map<number, number>,
    deviceId: number,
    submittedAt: number,
): void {
    const latestSubmission = latestSubmissionByDevice.get(deviceId);
    if (latestSubmission === undefined || submittedAt > latestSubmission) {
        latestSubmissionByDevice.set(deviceId, submittedAt);
    }
}

function deviceStatusFromLatestSubmission(
    latestSubmission: number,
    now: Date,
): DeviceStatus | null {
    const monthsSinceLastSubmission = differenceInCalendarMonths(
        now,
        latestSubmission,
    );
    if (monthsSinceLastSubmission > INACTIVE_MAX_MONTHS) return null;
    if (monthsSinceLastSubmission <= 0) return 'active';
    if (monthsSinceLastSubmission <= LAPSING_MAX_MONTHS) return 'lapsing';
    return 'inactive';
}
