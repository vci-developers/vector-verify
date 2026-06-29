'use client';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import type { DivIcon, LatLngExpression } from 'leaflet';
import { useMemo, type ReactNode } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Spinner } from '@/components/ui/spinner';
import { useSiteGeocode } from '@/features/operations/geographical-summary/hooks/use-site-geocode';
import MapNavigator from '@/features/operations/geographical-summary/components/map-navigator';
import MarkerClusterLayer from '@/features/operations/geographical-summary/components/marker-cluster-layer';
import { buildGeocodedBounds } from '@/features/operations/geographical-summary/utils/geocoded-bounds';
import type { GeocodableMarker } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';

const DEFAULT_CENTER: LatLngExpression = { lat: 0, lng: 0 };
const DEFAULT_ZOOM = 2;

interface GeocodedClusterMapProps {
    markers: GeocodableMarker[];
    selectedLocations: string[];
    selectedMarkerId: string | null;
    onMarkerSelect: (id: string | null) => void;
    renderIcon: (markerId: string, isSelected: boolean) => DivIcon;
    loadingLabel: string;
    renderSidePanel: (isLoading: boolean) => ReactNode;
}

export default function GeocodedClusterMap({
    markers,
    selectedLocations,
    selectedMarkerId,
    onMarkerSelect,
    renderIcon,
    loadingLabel,
    renderSidePanel,
}: GeocodedClusterMapProps) {
    const { markerIdsToGeocodedPosition, isGeocoding } =
        useSiteGeocode(markers);

    const markerBounds = useMemo(
        () => buildGeocodedBounds(markers, markerIdsToGeocodedPosition),
        [markers, markerIdsToGeocodedPosition],
    );

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
                        selectedLocations={selectedLocations}
                    />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MarkerClusterLayer
                        markers={markers}
                        markerIdsToGeocodedPosition={
                            markerIdsToGeocodedPosition
                        }
                        selectedMarkerId={selectedMarkerId}
                        onMarkerSelect={onMarkerSelect}
                        renderIcon={renderIcon}
                    />
                </MapContainer>
                {isGeocoding && (
                    <div className="absolute bottom-4 left-1/2 z-1000 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs shadow">
                        <Spinner className="text-muted-foreground h-3 w-3" />
                        <span className="text-muted-foreground">
                            {loadingLabel}
                        </span>
                    </div>
                )}
            </div>
            {renderSidePanel(isGeocoding)}
        </div>
    );
}
