import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import { format } from 'date-fns';

export function formatCollectionCycleLabel(cycle: CollectionCycle): string {
    const start = format(new Date(cycle.startDate), 'MMM d');
    const end = format(new Date(cycle.endDate), 'MMM d, yyyy');
    return `Cycle ${cycle.cycleNumber} · ${start} – ${end}`;
}
