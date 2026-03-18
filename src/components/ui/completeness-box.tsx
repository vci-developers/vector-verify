import { Spinner } from "@/components/ui/spinner";

interface CompletenessBoxProps {
    percentage: number;
    isLoading?: boolean;
    highThreshold?: number;
    mediumThreshold?: number;
}

function getCompletenessColor(
    percentage: number,
    highThreshold: number,
    mediumThreshold: number
): string {
    if (percentage >= highThreshold) return "bg-success/10 text-success border-success/50";
    if (percentage >= mediumThreshold) return "bg-warning/20 text-warning-foreground border-warning/50";
    return "bg-destructive/20 text-destructive border-destructive/50";
}

export function CompletenessBox({
    percentage,
    isLoading = false,
    highThreshold = 80,
    mediumThreshold = 50,
}: CompletenessBoxProps) {
    if (isLoading) {
        return <span className="px-2 py-1 rounded border bg-muted text-muted-foreground border-border"><Spinner className="size-3" /></span>;
    }
    return (
        <span className={`px-2 py-1 rounded border ${getCompletenessColor(percentage, highThreshold, mediumThreshold)}`}>
            {Math.round(percentage)}%
        </span>
    );
}
