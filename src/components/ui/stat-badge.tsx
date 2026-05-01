import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface StatBadgeProps {
    label: string;
    value: number;
    description?: string;
}

export default function StatBadge({
    label,
    value,
    description,
}: StatBadgeProps) {
    return (
        <div className="border-border rounded-lg border px-3 py-1.5">
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
                {label}
                {description && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-3 w-3 cursor-default" />
                            </TooltipTrigger>
                            <TooltipContent>{description}</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            <p className="text-lg leading-tight font-bold">{value}</p>
        </div>
    );
}
