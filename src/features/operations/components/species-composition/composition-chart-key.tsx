import type { ChartConfig } from '@/components/ui/chart';

interface CompositionChartKeyProps {
    specimenCountsByClass: {
        specimenClass: string;
        specimenCount: number;
    }[];
    specimenChartConfig: ChartConfig;
    totalSpecimenCount: number;
}

export default function CompositionChartKey({
    specimenCountsByClass,
    specimenChartConfig,
    totalSpecimenCount,
}: CompositionChartKeyProps) {
    if (specimenCountsByClass.length === 0) {
        return (
            <div className="bg-muted/30 rounded-lg border border-dashed p-4">
                <p className="text-sm font-semibold">No classes to display</p>
                <p className="text-muted-foreground mt-1 text-sm">
                    Composition values will appear once specimens are recorded.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border p-4">
            <p className="text-sm font-semibold">Key</p>
            <div className="mt-3 space-y-3">
                {specimenCountsByClass.map(
                    ({ specimenClass, specimenCount }) => {
                        const percentage =
                            totalSpecimenCount > 0
                                ? (specimenCount / totalSpecimenCount) * 100
                                : 0;

                        return (
                            <div
                                key={specimenClass}
                                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 text-sm"
                            >
                                <span
                                    className="h-3 w-3 rounded-sm"
                                    style={{
                                        backgroundColor:
                                            specimenChartConfig[specimenClass]
                                                ?.color,
                                    }}
                                />
                                <span className="min-w-0 truncate">
                                    {specimenChartConfig[specimenClass]
                                        ?.label ?? specimenClass}
                                </span>
                                <span className="text-muted-foreground text-right text-xs tabular-nums">
                                    {specimenCount.toLocaleString()} -{' '}
                                    {percentage.toFixed(0)}%
                                </span>
                            </div>
                        );
                    },
                )}
            </div>
        </div>
    );
}
