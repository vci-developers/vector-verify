import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface TrendIndicatorProps {
    percentChange: number | 'new';
    newLabel?: string;
    description?: string;
    className?: string;
}

export default function TrendIndicator({
    percentChange,
    newLabel,
    description,
    className,
}: TrendIndicatorProps) {
    const isPositive = percentChange === 'new' || percentChange >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const content =
        percentChange === 'new'
            ? newLabel
            : `${Math.abs(percentChange).toFixed(1)}%`;

    const indicator = (
        <span
            className={cn(
                'inline-flex items-center gap-1 text-sm font-medium',
                isPositive ? 'text-success' : 'text-destructive',
                className,
            )}
        >
            <Icon className="size-4" />
            {content}
        </span>
    );

    if (!description) return indicator;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <button type="button" className="cursor-default">
                    {indicator}
                </button>
            </TooltipTrigger>
            <TooltipContent>{description}</TooltipContent>
        </Tooltip>
    );
}
