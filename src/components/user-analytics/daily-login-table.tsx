'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { UserLoginActivity } from '@/api/user/validation/get-user-auth-events-schema';
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    parseISO,
    startOfMonth,
} from 'date-fns';
import { useTranslations } from 'next-intl';

interface DailyLoginTableProps {
    users: UserLoginActivity[];
    selectedMonth: Date;
}

export default function DailyLoginTable({
    users,
    selectedMonth,
}: DailyLoginTableProps) {
    const t = useTranslations('UserAnalytics');
    const monthDays = eachDayOfInterval({
        start: startOfMonth(selectedMonth),
        end: endOfMonth(selectedMonth),
    }).map(day => format(day, 'yyyy-MM-dd'));
    const monthDayLabels = monthDays.map(date => ({
        date,
        label: format(parseISO(date), 'd'),
    }));
    const dailyLoginsByUser = new Map(
        users.map(user => [
            user.userId,
            new Map(
                user.dailyLogins.map(dailyLogin => [
                    dailyLogin.date,
                    dailyLogin.count,
                ]),
            ),
        ]),
    );

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
            <h3 className="text-sm font-medium">{t('dailyLoginsTitle')}</h3>

            <Table containerClassName="min-h-0 flex-1 overflow-auto">
                <TableHeader className="bg-background sticky top-0 z-20">
                    <TableRow>
                        <TableHead className="bg-background sticky left-0 z-10">
                            {t('nameColumn')}
                        </TableHead>
                        <TableHead>{t('emailColumn')}</TableHead>
                        {monthDayLabels.map(({ date, label }) => (
                            <TableHead key={date} className="text-center">
                                {label}
                            </TableHead>
                        ))}
                        <TableHead className="bg-background sticky right-0 z-10">
                            {t('totalLoginsColumn')}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map(user => (
                        <TableRow key={user.userId}>
                            <TableCell
                                className="bg-background sticky left-0 z-10 max-w-40 truncate"
                                title={user.name ?? user.email}
                            >
                                {user.name ?? user.email}
                            </TableCell>
                            <TableCell
                                className="text-muted-foreground max-w-48 truncate"
                                title={user.email}
                            >
                                {user.email}
                            </TableCell>
                            {monthDays.map(date => (
                                <TableCell key={date} className="text-center">
                                    {dailyLoginsByUser
                                        .get(user.userId)
                                        ?.get(date) ?? 0}
                                </TableCell>
                            ))}
                            <TableCell className="bg-background sticky right-0 z-10 font-medium">
                                {user.totalLogins}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
