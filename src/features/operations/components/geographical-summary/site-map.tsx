'use client';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useVillageGeocode } from './hooks/use-village-geocode';
import MarkerLayer from './components/map/marker-layer';
import MapNavigator from './components/map/map-navigator';
import type { VillageMarker } from '@/features/operations/lib/use-site-markers';

export type { VillageMarker };

const DEFAULT_CENTER: LatLngExpression = { lat: 1.5, lng: 32.5 };
const DEFAULT_ZOOM = 7;

interface SiteMapProps {
    markers: VillageMarker[];
    district: string;
}

export default function SiteMap({ markers, district }: SiteMapProps) {
    const { positions, isGeocoding } = useVillageGeocode(markers);

    const bounds = useMemo((): LatLngBoundsExpression | null => {
        const coords = markers
            .map(m => positions.get(m.id))
            .filter((p): p is { lat: number; lng: number } => p != null);
        if (coords.length === 0) return null;
        const lats = coords.map(p => p.lat);
        const lngs = coords.map(p => p.lng);
        return [
            [Math.min(...lats), Math.min(...lngs)],
            [Math.max(...lats), Math.max(...lngs)],
        ];
    }, [markers, positions]);

    return (
        <>
            {isGeocoding && (
                <div className="absolute bottom-4 left-1/2 z-1000 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs shadow">
                    <Loader2 className="text-muted-foreground h-3 w-3 animate-spin" />
                    <span className="text-muted-foreground">
                        Locating villages…
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
                <MapNavigator bounds={bounds} district={district} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MarkerLayer markers={markers} positions={positions} />
            </MapContainer>
        </>
    );
}
