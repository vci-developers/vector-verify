import type { ReviewLog } from '@/api/review-log/validation/review-log-schema';
import { specimenIdEditLogSchema } from '@/api/review-log/validation/specimen-id-edit-log-schema';

export function getSpecimenIdEditHistory(
    reviewLogs: ReviewLog[],
    specimenId: number,
) {
    const edits = reviewLogs
        .flatMap(log => {
            if ((log.specimenId ?? log.fields?.specimenId) !== specimenId) {
                return [];
            }

            const parsed = specimenIdEditLogSchema.safeParse(log);
            return parsed.success ? [parsed.data] : [];
        })
        .sort(
            (first, second) =>
                first.createdAt - second.createdAt || first.id - second.id,
        );

    const earliestEdit = edits[0];
    const latestEditLog = edits.at(-1);
    if (!earliestEdit || !latestEditLog) return undefined;

    return {
        originalValue: earliestEdit.changes.specimenId.before,
        latestEditLog,
    };
}
