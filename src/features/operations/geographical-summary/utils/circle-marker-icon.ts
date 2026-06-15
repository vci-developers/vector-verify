import L from 'leaflet';

interface CircleMarkerIconOptions {
    radius: number;
    color: string;
    isSelected: boolean;
}

export function buildCircleMarkerIcon({
    radius,
    color,
    isSelected,
}: CircleMarkerIconOptions): L.DivIcon {
    const size = radius * 2;
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
