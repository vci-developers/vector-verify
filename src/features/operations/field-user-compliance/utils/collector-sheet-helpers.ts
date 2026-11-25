import type { GetSessionSpecimensCountSuccessPayload } from '@/api/specimen/validation/get-session-specimens-count-schema';
import type { SpecimenClassificationAxis } from '@/api/specimen/validation/specimen-schema';

const UNKNOWN_SPECIMEN_CLASS = 'Unknown';

export function sumSessionSpecimenCountsByClass(
    specimenClassificationAxis: SpecimenClassificationAxis,
    sessionSpecimenCounts: GetSessionSpecimensCountSuccessPayload['sessions'],
): { specimenClass: string; specimenCount: number }[] {
    const specimenCountsByClass = new Map<string, number>();
    for (const sessionSpecimenCount of sessionSpecimenCounts) {
        for (const specimenGroup of sessionSpecimenCount.groups) {
            const specimenClass =
                specimenGroup[specimenClassificationAxis] ||
                UNKNOWN_SPECIMEN_CLASS;
            specimenCountsByClass.set(
                specimenClass,
                (specimenCountsByClass.get(specimenClass) ?? 0) +
                    specimenGroup.count,
            );
        }
    }
    return [...specimenCountsByClass]
        .map(([specimenClass, specimenCount]) => ({
            specimenClass,
            specimenCount,
        }))
        .sort(
            (firstClassCount, secondClassCount) =>
                secondClassCount.specimenCount - firstClassCount.specimenCount,
        );
}
