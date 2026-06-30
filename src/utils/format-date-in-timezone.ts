import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

function getValidTimezone(timezone: string | null): string {
    if (!timezone) return 'UTC';
    try {
        Intl.DateTimeFormat('en-US', { timeZone: timezone });
        return timezone;
    } catch {
        return 'UTC';
    }
}

export function formatDateInTimezone(
    timestampMs: number,
    timezone: string | null,
    formatPattern: string,
): string {
    return format(
        new TZDate(timestampMs, getValidTimezone(timezone)),
        formatPattern,
    );
}
