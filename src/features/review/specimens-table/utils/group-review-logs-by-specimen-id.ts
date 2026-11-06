import type { ReviewLog } from '@/api/review-log/validation/review-log-schema';

export function groupReviewLogsBySpecimenId(logs: ReviewLog[]) {
    const logsBySpecimenId = new Map<number, ReviewLog[]>();
    for (const log of logs) {
        const specimenId = log.specimenId ?? log.fields?.specimenId;
        if (typeof specimenId !== 'number') continue;
        const specimenLogs = logsBySpecimenId.get(specimenId) ?? [];
        specimenLogs.push(log);
        logsBySpecimenId.set(specimenId, specimenLogs);
    }
    return logsBySpecimenId;
}
