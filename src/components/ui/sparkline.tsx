'use client';

import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Line, LineChart } from 'recharts';
import { cn } from '@/utils/cn';

interface SparklineProps {
    values: number[];
    isPositive: boolean;
    className?: string;
}

export default function Sparkline({
    values,
    isPositive,
    className,
}: SparklineProps) {
    const data = values.map(value => ({ value }));
    const config: ChartConfig = {
        value: {
            color: isPositive ? 'var(--success)' : 'var(--destructive)',
        },
    };

    return (
        <ChartContainer
            config={config}
            className={cn('aspect-auto h-5 w-13', className)}
            initialDimension={{ width: 52, height: 20 }}
        >
            <LineChart data={data}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                />
            </LineChart>
        </ChartContainer>
    );
}
