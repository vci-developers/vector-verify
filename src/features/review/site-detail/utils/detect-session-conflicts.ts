import type { SessionWithFormData } from '@/api/surveillance-form/validation/session-with-form-data-schema';
import { normalizeSessionRows } from '@/features/review/site-detail/utils/normalize-form-data';

export function getConflictingLabels(
    sessions: SessionWithFormData[],
): Set<string> {
    const normalizedSessions = sessions.map(({ session, formData }) =>
        normalizeSessionRows(session, formData),
    );
    const conflicting = new Set<string>();
    const allLabels = new Set(
        normalizedSessions.flatMap(rows => rows.map(row => row.label)),
    );
    for (const label of allLabels) {
        const values = normalizedSessions.map(
            rows => rows.find(row => row.label === label)?.value,
        );
        if (new Set(values).size > 1) conflicting.add(label);
    }
    return conflicting;
}
