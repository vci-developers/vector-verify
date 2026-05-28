import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import { format } from 'date-fns';

export function formatCollectionCycleLabel(
    cycle: CollectionCycle,
    t: (key: string, values?: Record<string, string | number>) => string,
): string {
    const start = format(new Date(cycle.startDate), 'MMM d');
    const end = format(new Date(cycle.endDate), 'MMM d, yyyy');
    return t('cycleLabel', { cycleNumber: cycle.cycleNumber, start, end });
}
