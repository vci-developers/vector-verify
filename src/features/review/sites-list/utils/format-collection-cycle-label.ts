import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';

export function formatCollectionCycleLabel(
    cycle: CollectionCycle,
    t: (key: string, values?: Record<string, string | number>) => string,
): string {
    const start = formatDateInTimezone(
        cycle.startDate,
        cycle.timezone,
        'MMM d',
    );
    const end = formatDateInTimezone(
        cycle.endDate,
        cycle.timezone,
        'MMM d, yyyy',
    );
    return t('cycleLabel', { cycleNumber: cycle.cycleNumber, start, end });
}
