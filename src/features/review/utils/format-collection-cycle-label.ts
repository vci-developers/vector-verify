import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';

export function formatCollectionCycleLabel(cycle: CollectionCycle): string {
    const start = formatDateInTimezone(cycle.startDate, cycle.timezone, 'MMM d');
    const end = formatDateInTimezone(
        cycle.endDate,
        cycle.timezone,
        'MMM d, yyyy',
    );
    return `Cycle ${cycle.cycleNumber} · ${start} – ${end}`;
}
