import { Skeleton, type SkeletonProps } from '@/components/ui/skeleton';

function SkeletonList({
    count,
    height,
    width,
    variant,
    rounded,
    animated,
}: SkeletonProps & { count: number }) {
    return (
        <div className="space-y-1">
            {Array.from({ length: count }).map((_, i) => (
                <Skeleton
                    key={i}
                    height={height}
                    width={width}
                    variant={variant}
                    rounded={rounded}
                    animated={animated}
                />
            ))}
        </div>
    );
}

export { SkeletonList };
