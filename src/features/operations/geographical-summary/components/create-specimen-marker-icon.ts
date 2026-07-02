import type { DivIcon } from 'leaflet';
import {
    ANOPHELES_COLOR,
    ANOPHELES_THRESHOLD,
} from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import { buildCircleMarkerIcon } from '@/features/operations/geographical-summary/utils/circle-marker-icon';

const MARKER_RADIUS_MIN = 8;
const MARKER_RADIUS_MAX = 26;
const MARKER_RADIUS_DIVISOR = 20;

export function createSpecimenMarkerIcon(
    totalSpecimens: number,
    anophelesCount: number,
    isSelected = false,
): DivIcon {
    const radius = Math.max(
        MARKER_RADIUS_MIN,
        Math.min(
            MARKER_RADIUS_MAX,
            MARKER_RADIUS_MIN + totalSpecimens / MARKER_RADIUS_DIVISOR,
        ),
    );
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

    return buildCircleMarkerIcon({ radius, color, isSelected });
}
