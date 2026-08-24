import { Skeleton, type SkeletonProps } from './skeleton';

function StatCardSkeleton({ variant }: SkeletonProps) {
    return (
        <div className="space-y-2 py-2">
            <Skeleton width="sm" height="xl" variant={variant} />
            <Skeleton width="lg" height="sm" variant={variant} />
        </div>
    );
}

export { StatCardSkeleton };
