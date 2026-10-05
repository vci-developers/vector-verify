'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { UserLoginActivity } from '@/api/user/validation/get-user-auth-events-schema';
import { useTranslations } from 'next-intl';

interface MonthlyUsersTableProps {
    users: UserLoginActivity[];
    distinctUserCount: number;
}

export default function MonthlyUsersTable({
    users,
    distinctUserCount,
}: MonthlyUsersTableProps) {
    const t = useTranslations('UserAnalytics');

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
            <h3 className="text-sm font-medium">{t('monthlyUsersTitle')}</h3>

            <Table containerClassName="min-h-0 flex-1 overflow-y-auto">
                <TableHeader className="bg-background sticky top-0 z-10">
                    <TableRow>
                        <TableHead>{t('nameColumn')}</TableHead>
                        <TableHead>{t('emailColumn')}</TableHead>
                        <TableHead>{t('totalLoginsColumn')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map(user => (
                        <TableRow key={user.userId}>
                            <TableCell
                                className="max-w-40 truncate"
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
                            <TableCell>{user.totalLogins}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter className="bg-background sticky bottom-0 border-2">
                    <TableRow>
                        <TableCell colSpan={2}>
                            {t('distinctUserCountLabel')}
                        </TableCell>
                        <TableCell>{distinctUserCount}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    );
}
