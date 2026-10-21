import { z } from 'zod';
import type { ReviewLog } from '@/api/session/validation/get-review-logs-schema';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import type { SpecimenChangelog } from '../validation/specimen-changelog-schema';

const changeValueSchema = z.union([
    z
        .object({ before: z.string().nullable(), after: z.string().nullable() })
        .transform(change => ({
            previousValue: change.before,
            value: change.after,
        })),
    z
        .object({
            oldValue: z.string().nullable(),
            newValue: z.string().nullable(),
        })
        .transform(change => ({
            previousValue: change.oldValue,
            value: change.newValue,
        })),
    z.object({
        previousValue: z.string().nullable(),
        value: z.string().nullable(),
    }),
    z
        .object({ from: z.string().nullable(), to: z.string().nullable() })
        .transform(change => ({
            previousValue: change.from,
            value: change.to,
        })),
    z
        .object({ old: z.string().nullable(), new: z.string().nullable() })
        .transform(change => ({
            previousValue: change.old,
            value: change.new,
        })),
]);
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
                    changes: predictionFields.flatMap(field => {
                        const parsed = changeValueSchema.safeParse(
                            log.changes?.[field],
                        );
                        return parsed.success
                            ? [{ field, ...parsed.data }]
                            : [];
                    }),
                };
            }),
    };
}
