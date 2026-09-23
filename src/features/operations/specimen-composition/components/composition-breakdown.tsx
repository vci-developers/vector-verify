'use client';

import type { ChartConfig } from '@/components/ui/chart';
import { cn } from '@/utils/cn';
import { useFormatter, useTranslations } from 'next-intl';

interface CompositionBreakdownProps {
    heading?: string;
    specimenCountsByClass: {
        specimenClass: string;
        specimenCount: number;
    }[];
    totalSpecimenCount: number;
    specimenChartConfig: ChartConfig;
    className?: string;
}

export default function CompositionBreakdown({
    heading,
    specimenCountsByClass,
    totalSpecimenCount,
    specimenChartConfig,
    className,
}: CompositionBreakdownProps) {
    const t = useTranslations('OperationsSpecimenComposition');
    const format = useFormatter();

    return (
        <div className={cn('grid min-w-45 gap-1.5 text-xs', className)}>
            {heading && <div className="font-medium">{heading}</div>}
            {specimenCountsByClass.map(({ specimenClass, specimenCount }) => (
                <div key={specimenClass} className="flex items-center gap-2">
                    <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                        style={{
                            backgroundColor:
                                specimenChartConfig[specimenClass]?.color,
                        }}
                    />
                    <span className="text-muted-foreground min-w-0 flex-1 truncate">
                        {specimenChartConfig[specimenClass]?.label ??
                            specimenClass}
                    </span>
                    <span className="font-mono font-medium tabular-nums">
                        {format.number(specimenCount)}
                    </span>
                    <span className="text-muted-foreground w-12 text-right font-mono tabular-nums">
                        {format.number(
                            totalSpecimenCount === 0
                                ? 0
                                : specimenCount / totalSpecimenCount,
                            { style: 'percent', maximumFractionDigits: 1 },
                        )}
                    </span>
                </div>
            ))}
            <div className="flex items-center gap-2 border-t pt-1.5 font-medium">
                <span className="flex-1">{t('total')}</span>
                <span className="font-mono tabular-nums">
                    {format.number(totalSpecimenCount)}
                </span>
                <span className="w-12" />
            </div>
        </div>
    );
}
