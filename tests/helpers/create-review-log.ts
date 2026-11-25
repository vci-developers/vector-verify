import {
    reviewLogSchema,
    type ReviewLog,
} from '@/api/review-log/validation/review-log-schema';

export function createReviewLog(overrides: Partial<ReviewLog> = {}): ReviewLog {
    return reviewLogSchema.parse({
        id: 1,
        specimenId: null,
        siteId: 89,
        year: 2026,
        month: 10,
        action: 'update_specimen_image_prediction',
        userId: 2,
        performedBy: { userId: 2, name: 'Reviewer' },
        collectionCycleId: 7,
        hasChanges: true,
        changes: null,
        fields: null,
        metadata: null,
        createdAt: 1000,
        updatedAt: 1000,
        ...overrides,
    });
}
