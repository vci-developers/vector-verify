import type { DivIcon } from 'leaflet';
import { DEVICE_HEALTH_COLOR } from '@/features/operations/geographical-summary/utils/device-marker-helpers';
import { buildCircleMarkerIcon } from '@/features/operations/geographical-summary/utils/circle-marker-icon';

const MARKER_RADIUS_MIN = 8;
const MARKER_RADIUS_MAX = 26;
const MARKER_RADIUS_PER_ACTIVE_DEVICE = 4;

export function createDeviceMarkerIcon(
    activeDeviceCount: number,
    lapsingDeviceCount: number,
    isSelected = false,
): DivIcon {
    const radius = Math.max(
        MARKER_RADIUS_MIN,
        Math.min(
            MARKER_RADIUS_MAX,
            MARKER_RADIUS_MIN +
                activeDeviceCount * MARKER_RADIUS_PER_ACTIVE_DEVICE,
        ),
    );
    const color =
        activeDeviceCount > 0
            ? DEVICE_HEALTH_COLOR.active
            : lapsingDeviceCount > 0
              ? DEVICE_HEALTH_COLOR.lapsing
              : DEVICE_HEALTH_COLOR.inactive;

    return buildCircleMarkerIcon({ radius, color, isSelected });
}
