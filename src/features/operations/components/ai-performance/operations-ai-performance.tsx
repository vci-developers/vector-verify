import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';
import OperationsAiPerformanceMatrix from '@/features/operations/components/ai-performance/operations-ai-performance-matrix';
import type { LocationQueryParam } from '@/lib/location/location-query';

interface OperationsAiPerformanceProps {
    locationQueryParam: LocationQueryParam;
    startDate: string;
    endDate: string;
}

const SUMMARY_CARDS = [
    {
        label: 'Coverage',
        value: '87.5%',
        description: 'of specimens labeled',
        className:
            'border-emerald-400/80 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]',
    },
    {
        label: 'Validated Specimens',
        value: '896',
        description: 'total validated',
        className:
            'border-emerald-400/80 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]',
    },
    {
        label: 'Last Update',
        value: '2h ago',
        description: '2026-02-24 14:30',
        className: 'border-border',
    },
] as const;

export default function OperationsAiPerformance({
    locationQueryParam,
    startDate,
    endDate,
}: OperationsAiPerformanceProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                <Info className="h-4 w-4" />
                <span>Metrics reflect only expert-validated specimens</span>
            </div>

            <div className="grid gap-3 lg:grid-cols-4">
                {SUMMARY_CARDS.map(card => (
                    <Card
                        key={card.label}
                        className={`gap-0 py-0 ${card.className}`}
                    >
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-sm">
                                {card.label}
                            </p>
                            <p className="mt-1 text-4xl font-semibold tracking-tight">
                                {card.value}
                            </p>
                            <p className="text-muted-foreground mt-2 text-xs">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}

                <OperationsAiPerformanceMatrix
                    locationQueryParam={locationQueryParam}
                    startDate={startDate}
                    endDate={endDate}
                />
            </div>
        </div>
    );
}
