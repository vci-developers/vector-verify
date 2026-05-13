import { Spinner } from '@/components/ui/spinner';

function getVisitCoverageColor(
    visitedPercentage: number,
    highThreshold: number,
    mediumThreshold: number,
): string {
    if (visitedPercentage >= highThreshold)
        return 'bg-success/10 text-success border-success/50';

    if (visitedPercentage >= mediumThreshold)
        return 'bg-warning/20 text-warning-foreground border-warning/50';

    return 'bg-destructive/20 text-destructive border-destructive/50';
}

interface ReviewVisitCoverageBadgeProps {
    visitedPercentage: number;
    isLoading?: boolean;
    highThreshold?: number;
    mediumThreshold?: number;
}

export default function ReviewVisitCoverageBadge({
    visitedPercentage,
    isLoading = false,
    highThreshold = 80,
    mediumThreshold = 50,
}: ReviewVisitCoverageBadgeProps) {
    if (isLoading) {
        return (
            <span className="bg-muted text-muted-foreground border-border rounded border px-2 py-1">
                <Spinner className="size-3" />
            </span>
        );
    }

    return (
        <span
            className={`rounded border px-2 py-1 ${getVisitCoverageColor(
                visitedPercentage,
                highThreshold,
                mediumThreshold,
            )}`}
        >
            {Math.round(visitedPercentage)}%
        </span>
    );
}
