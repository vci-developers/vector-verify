'use client';

import { useGetAllUserAuthEvents } from '@/api/user/hooks/use-get-all-user-auth-events';
import { useGetUsers } from '@/api/user/hooks/use-get-users';
import EmptyBanner from '@/components/ui/empty-banner';
import ErrorBanner from '@/components/ui/error-banner';
import { Input } from '@/components/ui/input';
import { SkeletonList } from '@/components/ui/skeleton-list';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import ActiveUsersTableRow from '@/components/user-analytics/active-users-table-row';
import UserAnalyticsLabeledTabs from '@/components/user-analytics/user-analytics-labeled-tabs';
import { buildActiveUsersFromAuthEvents } from '@/components/user-analytics/utils/build-active-users-from-auth-events';
import {
    ACTIVE_USERS_WINDOW_LABEL_KEYS,
    buildActiveUsersWindow,
    DEFAULT_ACTIVE_USERS_WINDOW,
    type ActiveUsersWindow,
} from '@/components/user-analytics/utils/build-active-users-window';
import { matchesActiveUserSearch } from '@/components/user-analytics/utils/matches-active-user-search';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

const ACTIVE_USERS_WINDOW_TABS: {
    value: ActiveUsersWindow;
    labelKey: string;
}[] = (['1d', '7d', '30d'] as const).map(window => ({
    value: window,
    labelKey: ACTIVE_USERS_WINDOW_LABEL_KEYS[window],
}));

interface ActiveUsersTableProps {
    open: boolean;
    programId: number;
}

export default function ActiveUsersTable({
    open,
    programId,
}: ActiveUsersTableProps) {
    const t = useTranslations('UserAnalytics');
    const [search, setSearch] = useState('');
    const [activeUsersWindow, setActiveUsersWindow] =
        useState<ActiveUsersWindow>(DEFAULT_ACTIVE_USERS_WINDOW);

    const activeUsersWindowRange = buildActiveUsersWindow(activeUsersWindow);
    const { data: getAuthEventsResult, isPending: isAuthEventsPending } =
        useGetAllUserAuthEvents(
            {
                startDate: activeUsersWindowRange.startDate,
                endDate: activeUsersWindowRange.endDate,
            },
            { enabled: open },
        );
    const { data: getUsersResult, isPending: isUsersPending } = useGetUsers({
        enabled: open,
    });

    const isLoading = isAuthEventsPending || isUsersPending;
    const isError = Boolean(
        (getAuthEventsResult && !getAuthEventsResult.ok) ||
        (getUsersResult && !getUsersResult.ok),
    );
    const activeUsers =
        getAuthEventsResult?.ok && getUsersResult?.ok
            ? buildActiveUsersFromAuthEvents(
                  getAuthEventsResult.data.events,
                  getUsersResult.data.users,
                  programId,
                  activeUsersWindowRange.startDateCutoff,
              )
            : null;

    const filteredActiveUsers = useMemo(
        () =>
            (activeUsers ?? []).filter(activeUser =>
                matchesActiveUserSearch(activeUser, search),
            ),
        [activeUsers, search],
    );

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
                <UserAnalyticsLabeledTabs
                    value={activeUsersWindow}
                    onValueChange={setActiveUsersWindow}
                    tabs={ACTIVE_USERS_WINDOW_TABS}
                />
                <Input
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder={t('activeUsersSearchPlaceholder')}
                    className="max-w-72"
                />
            </div>

            {isLoading ? (
                <SkeletonList count={5} height="lg" width="full" />
            ) : isError ? (
                <ErrorBanner message={t('activeUsersError')} />
            ) : (activeUsers ?? []).length === 0 ? (
                <EmptyBanner message={t('activeUsersEmpty')} />
            ) : filteredActiveUsers.length === 0 ? (
                <EmptyBanner message={t('activeUsersNoSearchResults')} />
            ) : (
                <Table containerClassName="min-h-0 flex-1 overflow-y-auto">
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('nameColumn')}</TableHead>
                            <TableHead>{t('emailColumn')}</TableHead>
                            <TableHead>{t('lastActiveColumn')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredActiveUsers.map(activeUser => (
                            <ActiveUsersTableRow
                                key={activeUser.userId}
                                activeUser={activeUser}
                                activeUsersWindow={activeUsersWindow}
                            />
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
