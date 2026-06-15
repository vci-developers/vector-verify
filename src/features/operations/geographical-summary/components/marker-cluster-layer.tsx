'use client';

import L from 'leaflet';
import 'leaflet.markercluster';
import { useEffect, useMemo, useRef } from 'react';
import { Marker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import type { Geocode } from '@/api/geocode/validation/geocode-schema';

type ClusterGroup = L.MarkerClusterGroup & {
    _spiderfied: L.MarkerCluster | null;
};

interface MarkerClusterLayerProps<TMarker extends { id: string }> {
    markers: TMarker[];
    markerIdsToGeocodedPosition: Map<string, Geocode>;
    selectedMarkerId: string | null;
    onMarkerSelect: (id: string | null) => void;
    renderIcon: (marker: TMarker, isSelected: boolean) => L.DivIcon;
}

export default function MarkerClusterLayer<TMarker extends { id: string }>({
    markers,
    markerIdsToGeocodedPosition,
    selectedMarkerId,
    onMarkerSelect,
    renderIcon,
}: MarkerClusterLayerProps<TMarker>) {
    const map = useMap();
    const clusterRef = useRef<ClusterGroup | null>(null);
    const markerRefs = useRef<Map<string, L.Marker>>(new Map());

    const positionMap = useMemo(() => {
        const result = new Map<string, [number, number]>();
        markers.forEach(marker => {
            const position = markerIdsToGeocodedPosition.get(marker.id);
            if (position)
                result.set(marker.id, [position.latitude, position.longitude]);
        });
        return result;
    }, [markers, markerIdsToGeocodedPosition]);

    useEffect(() => {
        if (!selectedMarkerId) return;
        const position = markerIdsToGeocodedPosition.get(selectedMarkerId);
        const markerInstance = markerRefs.current.get(selectedMarkerId);
        if (!position || !markerInstance) return;

        const cluster = clusterRef.current;
        const visibleParent = cluster?.getVisibleParent(markerInstance);
        const latitudeLongitude: [number, number] = [
            position.latitude,
            position.longitude,
        ];

        if (
            !visibleParent ||
            visibleParent === markerInstance ||
            cluster?._spiderfied === visibleParent
        ) {
            if (!map.getBounds().contains(latitudeLongitude)) {
                map.panTo(latitudeLongitude);
            }
            return;
        }

        const doSpiderfy = () => (visibleParent as L.MarkerCluster).spiderfy();
        map.once('moveend', doSpiderfy);
        map.panTo(visibleParent.getLatLng());
        return () => {
            map.off('moveend', doSpiderfy);
        };
    }, [selectedMarkerId, markerIdsToGeocodedPosition, map]);

    return (
        <MarkerClusterGroup ref={clusterRef} chunkedLoading>
            {markers.map(marker => {
                const position = positionMap.get(marker.id);
                if (!position) return null;

                return (
                    <Marker
                        key={marker.id}
                        ref={leafletMarker => {
                            if (leafletMarker)
                                markerRefs.current.set(
                                    marker.id,
                                    leafletMarker,
                                );
                            else markerRefs.current.delete(marker.id);
                        }}
                        position={position}
                        icon={renderIcon(
                            marker,
                            selectedMarkerId === marker.id,
                        )}
                        eventHandlers={{
                            click: event => {
                                L.DomEvent.stopPropagation(event);
                                onMarkerSelect(
                                    selectedMarkerId === marker.id
                                        ? null
                                        : marker.id,
                                );
                            },
                        }}
                    />
                );
            })}
        </MarkerClusterGroup>
    );
}
