import type { LucideIcon } from 'lucide-react';

interface CompositionEmptyChartPanelProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export default function CompositionEmptyChartPanel({
    icon: Icon,
    title,
    description,
}: CompositionEmptyChartPanelProps) {
    return (
        <div className="bg-muted/30 flex h-62.5 flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center">
            <Icon className="text-muted-foreground/70 mb-4 h-10 w-10" />
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-muted-foreground mt-1 max-w-60 text-sm">
                {description}
            </p>
        </div>
    );
}
