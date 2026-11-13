import { z } from 'zod';
import type { ReviewLog } from '@/api/review-log/validation/review-log-schema';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import type { SpecimenChangelog } from '../types/specimen-changelog';
import { getOrderedSpecimenImages } from '@/lib/specimen/get-ordered-specimen-images';
import { specimenIdEditLogSchema } from '@/api/review-log/validation/specimen-id-edit-log-schema';

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
    specimenLogs: ReviewLog[],
): SpecimenChangelog {
    const orderedImages = getOrderedSpecimenImages(specimen);
    return {
        specimenId: specimen.specimenId,
        sessionId: specimen.sessionId,
        siteId,
        timezone,
        edits: specimenLogs.flatMap((log): SpecimenChangelog['edits'] => {
            const entry = {
                id: log.id,
                reviewerName: log.performedBy?.name ?? null,
                createdAt: log.createdAt,
            };
            if (log.action === 'update_specimen_thumbnail_prediction') {
                const parsed = specimenIdEditLogSchema.safeParse(log);
                const numericSpecimenId =
                    log.specimenId ?? log.fields?.specimenId;
                if (!parsed.success || numericSpecimenId !== specimen.id)
                    return [];
                const change = parsed.data.changes.specimenId;
                return [
                    {
                        ...entry,
                        scope: 'specimen',
                        imageNumber: null,
                        changes: [
                            {
                                field: 'specimenId',
                                previousValue: change.before,
                                value: change.after,
                            },
                        ],
                    },
                ];
            }
            if (log.action !== 'update_specimen_image_prediction') return [];

            const imageChanges = imageChangesSchema.safeParse(
                log.changes?.image,
            );
            const imageId = log.fields?.imageId ?? log.metadata?.imageId;
            const imageIndex = orderedImages.findIndex(
                image => image.id === imageId,
            );
            return [
                {
                    ...entry,
                    scope: 'image',
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
                },
            ];
        }),
    };
}
