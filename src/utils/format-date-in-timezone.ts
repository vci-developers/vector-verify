import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

export function formatDateInTimezone(
    timestampMs: number,
    timezone: string | null,
    formatPattern: string,
): string {
    return format(new TZDate(timestampMs, timezone ?? 'UTC'), formatPattern);
}
