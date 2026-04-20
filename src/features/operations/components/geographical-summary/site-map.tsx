'use client';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import { Fragment, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useSiteGeocode } from './hooks/use-site-geocode';
import MarkerLayer from './components/map/marker-layer';
import MapNavigator from './components/map/map-navigator';
import type { SiteMarker } from '@/features/operations/utils/site-marker-data';

const DEFAULT_CENTER: LatLngExpression = { lat: 1.5, lng: 32.5 };
const DEFAULT_ZOOM = 7;

interface SiteMapProps {
    markers: SiteMarker[];
    selectedLocation: string;
}

export default function SiteMap({ markers, selectedLocation }: SiteMapProps) {
    const { markerIdsToGeocodedPosition, isGeocoding } =
        useSiteGeocode(markers);

    const bounds = useMemo((): LatLngBoundsExpression | null => {
        const geocodedCoordinates = markers
            .map(marker => markerIdsToGeocodedPosition.get(marker.id))
            .filter(
                (
                    position,
                ): position is { latitude: number; longitude: number } =>
                    position != null,
            );
        if (geocodedCoordinates.length === 0) return null;
        const latitudes = geocodedCoordinates.map(
            position => position.latitude,
        );
        const longitudes = geocodedCoordinates.map(
            position => position.longitude,
        );
        return [
            [Math.min(...latitudes), Math.min(...longitudes)],
            [Math.max(...latitudes), Math.max(...longitudes)],
        ];
    }, [markers, markerIdsToGeocodedPosition]);

    return (
        <Fragment>
            {isGeocoding && (
                <div className="absolute bottom-4 left-1/2 z-1000 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs shadow">
                    <Loader2 className="text-muted-foreground h-3 w-3 animate-spin" />
                    <span className="text-muted-foreground">
                        Locating sites…
                    </span>
                </div>
            )}
            <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                style={{ height: '100%', width: '100%' }}
                className="rounded-md"
                scrollWheelZoom
            >
                <MapNavigator
                    bounds={bounds}
                    selectedLocation={selectedLocation}
                />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MarkerLayer
                    markers={markers}
                    markerIdsToGeocodedPosition={markerIdsToGeocodedPosition}
                />
            </MapContainer>
        </Fragment>
    );
}
