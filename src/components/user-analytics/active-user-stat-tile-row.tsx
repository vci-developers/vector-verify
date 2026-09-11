import ActiveUserStatTile from '@/components/user-analytics/active-user-stat-tile';
import type { ActiveUserTrendSummary } from '@/components/user-analytics/utils/build-active-user-trend-changes';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';

interface ActiveUserStatTileRowProps {
    trendChanges: ActiveUserTrendSummary | null;
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
        <div className="flex flex-col gap-1.5">
            <div className="grid gap-3 sm:grid-cols-3">
                {tiles.map(({ label, change }, index) => (
                    <ActiveUserStatTile
                        key={index}
                        label={label}
                        change={change}
                        isLoading={isLoading}
                    />
                ))}
            </div>

            {!isLoading && trendChanges && (
                <p className="text-muted-foreground text-xs">
                    {t('statsAsOf', {
                        relativeTime: formatDistanceToNow(
                            parseISO(trendChanges.snapshotUpdatedAt),
                            { addSuffix: true },
                        ),
                    })}
                </p>
            )}
        </div>
    );
}
