import L from 'leaflet';
import { DEVICE_HEALTH_COLOR } from '@/features/operations/geographical-summary/utils/device-marker-helpers';

const MARKER_RADIUS_MIN = 8;
const MARKER_RADIUS_MAX = 26;
const MARKER_RADIUS_PER_ACTIVE_DEVICE = 4;

export function createDeviceMarkerIcon(
    activeDeviceCount: number,
    lapsingDeviceCount: number,
    isSelected = false,
): L.DivIcon {
    const radius = Math.max(
        MARKER_RADIUS_MIN,
        Math.min(
            MARKER_RADIUS_MAX,
            MARKER_RADIUS_MIN +
                activeDeviceCount * MARKER_RADIUS_PER_ACTIVE_DEVICE,
        ),
    );
    const size = radius * 2;
    const color =
        activeDeviceCount > 0
            ? DEVICE_HEALTH_COLOR.active
            : lapsingDeviceCount > 0
              ? DEVICE_HEALTH_COLOR.lapsing
              : DEVICE_HEALTH_COLOR.inactive;
    const boxShadow = isSelected
        ? '0 0 0 3px var(--primary), 0 1px 4px rgba(0,0,0,0.4)'
        : '0 1px 4px rgba(0,0,0,0.4)';
    const style = [
        `width:${size}px`,
        `height:${size}px`,
        `background:${color}`,
        'border-radius:50%',
        'border:2.5px solid white',
        `box-shadow:${boxShadow}`,
        'box-sizing:border-box',
    ].join(';');

    return L.divIcon({
        html: `<div style="${style}"></div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [radius, radius],
    });
}
