'use client';

import type { UserLoginActivity } from '@/api/user/validation/get-user-auth-events-schema';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    parseISO,
    startOfMonth,
} from 'date-fns';
import { useTranslations } from 'next-intl';
import { CartesianGrid, Label, Line, LineChart, XAxis, YAxis } from 'recharts';

interface DailyLoginChartProps {
    users: UserLoginActivity[];
    selectedMonth: Date;
}

export default function DailyLoginChart({
    users,
    selectedMonth,
}: DailyLoginChartProps) {
    const t = useTranslations('UserAnalytics');

    const loginChartConfig: ChartConfig = {
        distinctUserCount: {
            label: t('distinctUserCountSeriesLabel'),
            color: 'var(--chart-1)',
        },
        totalLogins: {
            label: t('totalLoginsSeriesLabel'),
            color: 'var(--chart-2)',
        },
    };
    const userDailyLogins = users.flatMap(user => user.dailyLogins);
    const monthDailyLoginTotals = eachDayOfInterval({
        start: startOfMonth(selectedMonth),
        end: endOfMonth(selectedMonth),
    }).map(day => {
        const date = format(day, 'yyyy-MM-dd');
        const userLoginsOnDate = userDailyLogins.filter(
            userDailyLogin => userDailyLogin.date === date,
        );
        return {
            date,
            distinctUserCount: userLoginsOnDate.length,
            totalLogins: userLoginsOnDate.reduce(
                (total, userDailyLogin) => total + userDailyLogin.count,
                0,
            ),
        };
    });
    const seriesKeys = Object.keys(loginChartConfig);

    return (
        <ChartContainer config={loginChartConfig} className="h-72 w-full">
            <LineChart
                data={monthDailyLoginTotals}
                margin={{ top: 8, right: 12, bottom: 32, left: 12 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={date => format(parseISO(date), 'MMM d')}
                >
                    <Label
                        value={t('axisDateLabel')}
                        position="bottom"
                        className="fill-muted-foreground text-sm font-bold"
                    />
                </XAxis>
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    allowDecimals={false}
                >
                    <Label
                        value={t('axisCountLabel')}
                        angle={-90}
                        position="left"
                        className="fill-muted-foreground text-sm font-bold"
                        style={{ textAnchor: 'middle' }}
                    />
                </YAxis>
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            className="min-w-45"
                            indicator="line"
                            labelFormatter={date =>
                                format(parseISO(date), 'MMM d, yyyy')
                            }
                        />
                    }
                />
                {seriesKeys.map(seriesKey => (
                    <Line
                        key={seriesKey}
                        type="monotone"
                        dataKey={seriesKey}
                        stroke={loginChartConfig[seriesKey]?.color}
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
            </LineChart>
        </ChartContainer>
    );
}
