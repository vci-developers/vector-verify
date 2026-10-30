import { z } from 'zod';
import type { ReviewLog } from '@/api/session/validation/get-review-logs-schema';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import type { SpecimenChangelog } from '../validation/specimen-changelog-schema';

const changeValueSchema = z
    .object({ before: z.string().nullable(), after: z.string().nullable() })
    .transform(change => ({
        previousValue: change.before,
        value: change.after,
    }));
const imageChangesSchema = z.record(z.string(), z.unknown());
const predictionFields = ['species', 'sex', 'abdomenStatus'] as const;

export function buildSpecimenChangelog(
    specimen: Specimen,
    siteId: number,
    timezone: string,
    logs: ReviewLog[],
): SpecimenChangelog {
    const thumbnailImageId =
        specimen.thumbnailImageId ?? specimen.thumbnailImage?.id;
    const orderedImages = [...(specimen.images ?? [])].sort(
        (first, second) =>
            Number(second.id === thumbnailImageId) -
            Number(first.id === thumbnailImageId),
    );
    return {
        specimenId: specimen.specimenId,
        sessionId: specimen.sessionId,
        siteId,
        timezone,
        edits: logs
            .filter(
                log =>
                    (log.specimenId ?? log.fields?.specimenId) === specimen.id,
            )
            .map(log => {
                const imageChanges = imageChangesSchema.safeParse(
                    log.changes?.image,
                );
                const imageId = log.fields?.imageId ?? log.metadata?.imageId;
                const imageIndex = orderedImages.findIndex(
                    image => image.id === imageId,
                );
                return {
                    id: log.id,
                    reviewerName: log.performedBy?.name ?? null,
                    createdAt: log.createdAt,
                    imageNumber: imageIndex >= 0 ? imageIndex + 1 : null,
                    imageId: typeof imageId === 'number' ? imageId : undefined,
                    changes: imageChanges.success
                        ? predictionFields.flatMap(field => {
                              const parsedChange = changeValueSchema.safeParse(
                                  imageChanges.data[field],
                              );
                              return parsedChange.success
                                  ? [{ field, ...parsedChange.data }]
                                  : [];
                          })
                        : [],
                };
            }),
    };
}
