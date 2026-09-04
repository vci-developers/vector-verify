import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { ActiveUser } from '@/components/user-analytics/utils/build-active-users-from-auth-events';
import {
    ACTIVE_USERS_WINDOW_LABEL_KEYS,
    type ActiveUsersWindow,
} from '@/components/user-analytics/utils/build-active-users-window';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useTranslations } from 'next-intl';

interface ActiveUsersTableRowProps {
    activeUser: ActiveUser;
    activeUsersWindow: ActiveUsersWindow;
}

export default function ActiveUsersTableRow({
    activeUser,
    activeUsersWindow,
}: ActiveUsersTableRowProps) {
    const t = useTranslations('UserAnalytics');

    return (
        <TableRow>
            <TableCell className="max-w-40">
                <div className="flex items-center gap-2">
                    <span
                        className="truncate text-sm font-medium"
                        title={activeUser.name ?? activeUser.email}
                    >
                        {activeUser.name ?? activeUser.email}
                    </span>
                    {activeUser.isNew && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Badge
                                    variant="outline"
                                    className="text-success shrink-0 cursor-default"
                                >
                                    {t('newUserBadge')}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                {t('newUserBadgeDescription', {
                                    window: t(
                                        ACTIVE_USERS_WINDOW_LABEL_KEYS[
                                            activeUsersWindow
                                        ],
                                    ).toLowerCase(),
                                })}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-muted-foreground max-w-48">
                <span className="block truncate" title={activeUser.email}>
                    {activeUser.email}
                </span>
            </TableCell>
            <TableCell className="text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(parseISO(activeUser.lastLoginAt), {
                    addSuffix: true,
                })}
            </TableCell>
        </TableRow>
    );
}
