export type SessionSegment =
    | { type: 'empty'; span: number }
    | { type: 'active'; span: number; totalCount: number };

export function buildSessionSegments(
    monthKeys: string[],
    sessionCountsByMonth: Record<string, number>,
): SessionSegment[] {
    const sessionSegments: SessionSegment[] = [];
    let i = 0;
    while (i < monthKeys.length) {
        const count = sessionCountsByMonth[monthKeys[i]!] ?? 0;
        if (count === 0) {
            let span = 0;
            while (
                i < monthKeys.length &&
                (sessionCountsByMonth[monthKeys[i]!] ?? 0) === 0
            ) {
                span++;
                i++;
            }
            sessionSegments.push({ type: 'empty', span });
        } else {
            let span = 0;
            let totalCount = 0;
            while (
                i < monthKeys.length &&
                (sessionCountsByMonth[monthKeys[i]!] ?? 0) > 0
            ) {
                totalCount += sessionCountsByMonth[monthKeys[i]!] ?? 0;
                span++;
                i++;
            }
            sessionSegments.push({ type: 'active', span, totalCount });
        }
    }
    return sessionSegments;
}
