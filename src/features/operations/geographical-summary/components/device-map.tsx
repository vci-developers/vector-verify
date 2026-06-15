'use client';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/spinner';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useSiteGeocode } from '../hooks/use-site-geocode';
import type { DeviceMarker } from '@/features/operations/geographical-summary/utils/device-marker-helpers';
import MapNavigator from './map-navigator';
import DeviceMarkerLayer from './device-marker-layer';
import DeviceInfoPanel, { type DeviceSiteRow } from './device-info-panel';

const DEFAULT_CENTER: LatLngExpression = { lat: 0, lng: 0 };
const DEFAULT_ZOOM = 2;

interface DeviceMapProps {
    markers: DeviceMarker[];
    siteRows: DeviceSiteRow[];
    selectedLocation: string;
    selectedMarkerId: string | null;
    onMarkerSelect: (id: string | null) => void;
}

export default function DeviceMap({
    markers,
    siteRows,
    selectedLocation,
    selectedMarkerId,
    onMarkerSelect,
}: DeviceMapProps) {
    const t = useTranslations('OperationsGeographicalSummary');
    const { markerIdsToGeocodedPosition, isGeocoding } =
        useSiteGeocode(markers);

    const markerBounds = useMemo((): LatLngBoundsExpression | null => {
        const geocodedPositions = markers.flatMap(marker => {
            const position = markerIdsToGeocodedPosition.get(marker.id);
            return position ? [position] : [];
        });
        if (geocodedPositions.length === 0) return null;
        const latitudes = geocodedPositions.map(position => position.latitude);
        const longitudes = geocodedPositions.map(
            position => position.longitude,
        );
        return [
            [Math.min(...latitudes), Math.min(...longitudes)],
            [Math.max(...latitudes), Math.max(...longitudes)],
        ];
    }, [markers, markerIdsToGeocodedPosition]);

    return (
        <div className="flex h-full">
            <div className="relative flex-1">
                <MapContainer
                    center={DEFAULT_CENTER}
                    zoom={DEFAULT_ZOOM}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-l-md"
                    scrollWheelZoom
                >
                    <MapNavigator
                        bounds={markerBounds}
                        selectedLocation={selectedLocation}
                    />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <DeviceMarkerLayer
                        markers={markers}
                        markerIdsToGeocodedPosition={
                            markerIdsToGeocodedPosition
                        }
                        selectedMarkerId={selectedMarkerId}
                        onMarkerSelect={onMarkerSelect}
                    />
                </MapContainer>
                {isGeocoding && (
                    <div className="absolute bottom-4 left-1/2 z-1000 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs shadow">
                        <Spinner className="text-muted-foreground h-3 w-3" />
                        <span className="text-muted-foreground">
                            {t('locatingDevices')}
                        </span>
                    </div>
                )}
            </div>
            <DeviceInfoPanel
                sites={siteRows}
                selectedMarkerId={selectedMarkerId}
                onMarkerSelect={onMarkerSelect}
                isLoading={isGeocoding}
            />
        </div>
    );
}
