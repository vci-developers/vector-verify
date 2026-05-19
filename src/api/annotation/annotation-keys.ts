import type { GetAnnotationsQueryParams } from '@/api/annotation/validation/get-annotations-schema';
import type { GetAnnotationsSummaryQueryParams } from '@/api/annotation/validation/get-annotations-summary-schema';

export const annotationKeys = {
    root: ['annotations'] as const,
    annotations: (queryParams?: GetAnnotationsQueryParams) =>
        ['annotations', queryParams] as const,
    annotationsSummary: (queryParams?: GetAnnotationsSummaryQueryParams) =>
        ['annotations', 'summary', queryParams] as const,
};
