import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';

interface AiPerformanceSummaryCardProps {
    accentClassName?: string;
    label: string;
    value: string;
    description: string;
}

export default function AiPerformanceSummaryCard({
    accentClassName,
    label,
    value,
    description,
}: AiPerformanceSummaryCardProps) {
    return (
        <Card className={cn('gap-0 py-0', accentClassName)}>
            <CardContent className="p-4">
                <p className="text-muted-foreground text-sm">{label}</p>
                <p className="mt-1 text-4xl font-semibold tracking-tight">
                    {value}
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
