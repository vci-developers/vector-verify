import { Card, CardContent } from '@/components/ui/card';
import StatBadge from '@/components/ui/stat-badge';
import { StatCardSkeleton } from '@/components/ui/stat-card-skeleton';
import TrendIndicator from '@/components/ui/trend-indicator';
import type { ActiveUserTrendChanges } from '@/components/user-analytics/utils/build-active-user-trend-changes';
import { useTranslations } from 'next-intl';

interface ActiveUserStatTileRowProps {
    trendChanges: ActiveUserTrendChanges | null;
    isLoading: boolean;
}

export default function ActiveUserStatTileRow({
    trendChanges,
    isLoading,
}: ActiveUserStatTileRowProps) {
    const t = useTranslations('UserAnalytics');

    const tiles = [
        { label: t('a1Label'), change: trendChanges?.daily },
        { label: t('a7Label'), change: trendChanges?.weekly },
        { label: t('a30Label'), change: trendChanges?.monthly },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-3">
            {tiles.map(({ label, change }) => {
                const trendPercentChange = change?.isNewFromZero
                    ? 'new'
                    : change?.percentChange;

                return (
                    <Card key={label} className="gap-0 py-3">
                        <CardContent className="px-3">
                            {isLoading || !change ? (
                                <StatCardSkeleton variant="default" />
                            ) : (
                                <div className="flex items-center justify-between gap-2">
                                    <StatBadge
                                        label={label}
                                        value={change.count}
                                    />
                                    {trendPercentChange != null && (
                                        <TrendIndicator
                                            percentChange={trendPercentChange}
                                            newLabel={t('newTrend')}
                                        />
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
