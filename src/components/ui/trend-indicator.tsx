import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TrendIndicatorProps {
    percentChange: number | 'new';
    newLabel?: string;
    className?: string;
}

export default function TrendIndicator({
    percentChange,
    newLabel,
    className,
}: TrendIndicatorProps) {
    if (percentChange === 'new') {
        return (
            <span
                className={cn(
                    'text-success inline-flex items-center gap-1 text-sm font-medium',
                    className,
                )}
            >
                <TrendingUp className="size-4" />
                {newLabel}
            </span>
        );
    }

    const isPositive = percentChange >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 text-sm font-medium',
                isPositive ? 'text-success' : 'text-destructive',
                className,
            )}
        >
            <Icon className="size-4" />
            {Math.abs(percentChange).toFixed(1)}%
        </span>
    );
}
