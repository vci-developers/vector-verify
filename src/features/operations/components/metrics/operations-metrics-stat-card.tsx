import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface OperationsMetricsStatCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
}

export default function OperationsMetricsStatCard({
    label,
    value,
    icon: Icon,
}: OperationsMetricsStatCardProps) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-teal-50 p-2.5">
                        <Icon className="h-5 w-5 text-teal-600" />
                    </div>
                    <Info className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                </div>
                <p className="text-muted-foreground mt-3 text-xs">{label}</p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
            </CardContent>
        </Card>
    );
}
