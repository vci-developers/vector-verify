import type { SessionWithFormFieldRows } from '@/api/surveillance-form/validation/session-with-rows-schema';

export function getConflictingLabels(
    forms: SessionWithFormFieldRows[],
): Set<string> {
    const conflicting = new Set<string>();
    const allLabels = new Set(
        forms.flatMap(({ rows }) => (rows ?? []).map(row => row.label)),
    );
    for (const label of allLabels) {
        const values = forms.map(
            ({ rows }) => rows?.find(row => row.label === label)?.value,
        );
        if (new Set(values).size > 1) conflicting.add(label);
    }
    return conflicting;
}
