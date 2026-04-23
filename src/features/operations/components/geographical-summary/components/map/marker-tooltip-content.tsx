import type { SiteMarker } from '@/features/operations/utils/site-marker-data';

const MAX_SPECIES = 5;

export function MarkerTooltipContent({
    marker,
    onClose,
}: {
    marker: SiteMarker;
    onClose?: () => void;
}) {
    return (
        <div
            className={
                onClose
                    ? 'border-primary relative min-w-40 border-l-2 pr-4 pl-2 text-xs'
                    : 'relative min-w-40 pr-4 text-xs'
            }
        >
            {onClose && (
                <button
                    onClick={e => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="text-muted-foreground hover:text-foreground absolute top-1 right-1 leading-none"
                    aria-label="Close"
                >
                    ×
                </button>
            )}
            <p className="font-semibold">{marker.siteName}</p>
            {marker.parentLocationName && (
                <p className="text-muted-foreground">
                    {marker.parentLocationName}
                </p>
            )}
            <hr className="border-border my-1" />
            <p>
                {marker.sessionCount} session
                {marker.sessionCount !== 1 ? 's' : ''}
            </p>
            <p>{marker.totalSpecimens.toLocaleString()} total specimens</p>
            <p>{marker.anophelesCount.toLocaleString()} Anopheles</p>
            {marker.speciesBreakdown.length > 0 && (
                <div className="border-border mt-1 space-y-0.5 border-t pt-1">
                    {marker.speciesBreakdown
                        .slice(0, MAX_SPECIES)
                        .map(({ species, count }) => (
                            <p key={species} className="text-muted-foreground">
                                <span className="mr-1">↳</span>
                                {species}: {count.toLocaleString()}
                            </p>
                        ))}
                </div>
            )}
            {marker.lastCollectionDate && (
                <p className="text-muted-foreground">
                    Last collection:{' '}
                    {new Date(marker.lastCollectionDate).toLocaleDateString()}
                </p>
            )}
        </div>
    );
}
