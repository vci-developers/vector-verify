'use client';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import { useMemo, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useSiteGeocode } from '../hooks/use-site-geocode';
import type { SiteMarker } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import MapNavigator from './map-navigator';
import MarkerLayer from './marker-layer';
import MarkerInfoPanel from './marker-info-panel';

const DEFAULT_CENTER: LatLngExpression = { lat: 0, lng: 0 };
const DEFAULT_ZOOM = 2;

interface SiteMapProps {
    markers: SiteMarker[];
    selectedLocation: string;
}

export default function SiteMap({ markers, selectedLocation }: SiteMapProps) {
    const { markerIdsToGeocodedPosition, isGeocoding } =
        useSiteGeocode(markers);

    const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(
        null,
    );

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
                    <MarkerLayer
                        markers={markers}
                        markerIdsToGeocodedPosition={
                            markerIdsToGeocodedPosition
                        }
                        selectedMarkerId={selectedMarkerId}
                        onMarkerSelect={setSelectedMarkerId}
                    />
                </MapContainer>
                {isGeocoding && (
                    <div className="absolute bottom-4 left-1/2 z-1000 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs shadow">
                        <Spinner className="text-muted-foreground h-3 w-3" />
                        <span className="text-muted-foreground">
                            Locating sites…
                        </span>
                    </div>
                )}
            </div>
            <MarkerInfoPanel
                markers={markers}
                selectedMarkerId={selectedMarkerId}
                onMarkerSelect={setSelectedMarkerId}
                isLoading={isGeocoding}
            />
        </div>
    );
}
