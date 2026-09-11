import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Sparkline from '@/components/ui/sparkline';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ActiveUserPeriodTrend } from '@/components/user-analytics/utils/build-active-user-trend-changes';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/utils/cn';

interface ActiveUserStatTileProps {
    label: string;
    change: ActiveUserPeriodTrend | undefined;
    isLoading: boolean;
}

export default function ActiveUserStatTile({
    label,
    change,
    isLoading,
}: ActiveUserStatTileProps) {
    const t = useTranslations('UserAnalytics');

    if (isLoading || !change) {
        return (
            <Card className="gap-0 py-3">
                <CardContent className="flex items-center justify-between gap-3 px-3">
                    <div className="space-y-1.5">
                        <Skeleton width="sm" height="xs" />
                        <Skeleton width="xs" height="xs" />
                        <Skeleton width="sm" height="md" />
                    </div>
                    <Skeleton width="xs" height="sm" />
                </CardContent>
            </Card>
        );
    }

    const isFirstActivity = change.priorCount === 0 && change.count > 0;
    const percentChange =
        change.priorCount != null && change.priorCount !== 0
            ? ((change.count - change.priorCount) / change.priorCount) * 100
            : change.priorCount === 0 && change.count === 0
              ? 0
              : null;
    const isPositive = isFirstActivity || (percentChange ?? 0) >= 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const percentChangeLabel = isFirstActivity
        ? t('newTrend')
        : percentChange != null
          ? `${Math.abs(percentChange).toFixed(1)}%`
          : null;
    const trendDescription =
        change.priorCount != null &&
        change.priorWindowStartDate &&
        change.priorWindowEndDate
            ? t('trendComparison', {
                  currentCount: change.count,
                  currentStartDate: change.windowStartDate,
                  currentEndDate: change.windowEndDate,
                  priorCount: change.priorCount,
                  priorStartDate: change.priorWindowStartDate,
                  priorEndDate: change.priorWindowEndDate,
              })
            : t('trendComparisonNoPriorData');

    return (
        <Card className="gap-0 py-3">
            <CardContent className="flex items-center justify-between gap-3 px-3">
                <div className="min-w-0">
                    <p className="text-muted-foreground truncate text-xs">
                        {label}
                    </p>
                    <p className="text-muted-foreground/70 truncate text-[11px] tabular-nums">
                        {t('windowDateRange', {
                            startDate: change.windowStartDate,
                            endDate: change.windowEndDate,
                        })}
                    </p>
                    <p className="mt-1 text-lg leading-tight font-bold tabular-nums">
                        {change.count}
                    </p>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button type="button" className="cursor-default">
                            <div className="flex shrink-0 flex-col items-end gap-0.5">
                                <Sparkline
                                    values={change.sparklineValues}
                                    isPositive={isPositive}
                                />
                                {percentChangeLabel && (
                                    <span
                                        className={cn(
                                            'inline-flex items-center gap-0.5 text-xs font-medium',
                                            isPositive
                                                ? 'text-success'
                                                : 'text-destructive',
                                        )}
                                    >
                                        <TrendIcon className="size-3" />
                                        {percentChangeLabel}
                                    </span>
                                )}
                            </div>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>{trendDescription}</TooltipContent>
                </Tooltip>
            </CardContent>
        </Card>
    );
}
