import L from 'leaflet';
import {
    ANOPHELES_COLOR,
    ANOPHELES_THRESHOLD,
} from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';

const MARKER_RADIUS_MIN = 8;
const MARKER_RADIUS_MAX = 26;
const MARKER_RADIUS_DIVISOR = 20;

export function createSpecimenMarkerIcon(
    totalSpecimens: number,
    anophelesCount: number,
    isSelected = false,
): L.DivIcon {
    const radius = Math.max(
        MARKER_RADIUS_MIN,
        Math.min(
            MARKER_RADIUS_MAX,
            MARKER_RADIUS_MIN + totalSpecimens / MARKER_RADIUS_DIVISOR,
        ),
    );
    const size = radius * 2;
    const color =
        anophelesCount === 0
            ? ANOPHELES_COLOR.none
            : anophelesCount < ANOPHELES_THRESHOLD.low
              ? ANOPHELES_COLOR.low
              : anophelesCount < ANOPHELES_THRESHOLD.moderate
                ? ANOPHELES_COLOR.moderate
                : anophelesCount < ANOPHELES_THRESHOLD.high
                  ? ANOPHELES_COLOR.high
                  : ANOPHELES_COLOR.critical;
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
