import type { ReviewLog } from '@/api/review-log/validation/review-log-schema';
import { predictionEditLogSchema } from '@/features/review/workspace/image/validation/prediction-edit-log-schema';

const PREDICTION_FIELDS = ['species', 'sex', 'abdomenStatus'];

function isEditOfImage(reviewLog: ReviewLog, imageId: number) {
    const parsedReviewLog = predictionEditLogSchema.safeParse(reviewLog);
    return (
        parsedReviewLog.success &&
        parsedReviewLog.data.fields.imageId === imageId &&
        PREDICTION_FIELDS.some(
            predictionField =>
                predictionField in parsedReviewLog.data.changes.image,
        )
    );
}

export function getLatestPredictionEditLog(
    reviewLogs: ReviewLog[],
    imageId: number,
): ReviewLog | undefined {
    return reviewLogs.reduce<ReviewLog | undefined>(
        (latestReviewLog, reviewLog) =>
            isEditOfImage(reviewLog, imageId) &&
            (!latestReviewLog ||
                reviewLog.createdAt > latestReviewLog.createdAt)
                ? reviewLog
                : latestReviewLog,
        undefined,
    );
}
