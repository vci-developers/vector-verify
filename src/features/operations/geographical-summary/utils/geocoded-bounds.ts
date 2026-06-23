import type { LatLngBoundsExpression } from 'leaflet';
import type { Geocode } from '@/api/geocode/validation/geocode-schema';
import type { GeocodableMarker } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';

export function buildGeocodedBounds(
    markers: GeocodableMarker[],
    markerIdsToGeocodedPosition: Map<string, Geocode>,
): LatLngBoundsExpression | null {
    const geocodedPositions = markers.flatMap(marker => {
        const position = markerIdsToGeocodedPosition.get(marker.id);
        return position ? [position] : [];
    });
    if (geocodedPositions.length === 0) return null;
    const latitudes = geocodedPositions.map(position => position.latitude);
    const longitudes = geocodedPositions.map(position => position.longitude);
    return [
        [Math.min(...latitudes), Math.min(...longitudes)],
        [Math.max(...latitudes), Math.max(...longitudes)],
    ];
}
