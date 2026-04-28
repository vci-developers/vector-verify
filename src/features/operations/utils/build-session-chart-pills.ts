export type SessionChartPill =
    | { type: 'empty'; span: number }
    | { type: 'active'; span: number; totalCount: number };

export function buildSessionChartPills(
    monthYearKeys: string[],
    sessionCountsByMonth: Record<string, number>,
): SessionChartPill[] {
    const sessionChartPills: SessionChartPill[] = [];
    let i = 0;
    while (i < monthYearKeys.length) {
        const count = sessionCountsByMonth[monthYearKeys[i]!] ?? 0;
        if (count === 0) {
            let span = 0;
            while (
                i < monthYearKeys.length &&
                (sessionCountsByMonth[monthYearKeys[i]!] ?? 0) === 0
            ) {
                span++;
                i++;
            }
            sessionChartPills.push({ type: 'empty', span });
        } else {
            let span = 0;
            let totalCount = 0;
            while (
                i < monthYearKeys.length &&
                (sessionCountsByMonth[monthYearKeys[i]!] ?? 0) > 0
            ) {
                totalCount += sessionCountsByMonth[monthYearKeys[i]!] ?? 0;
                span++;
                i++;
            }
            sessionChartPills.push({ type: 'active', span, totalCount });
        }
    }
    return sessionChartPills;
}
