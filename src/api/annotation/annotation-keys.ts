import type { GetAnnotationsQueryParams } from "@/api/annotation/validation/get-annotations-schema";

export const annotationKeys = {
    root: ['annotations'] as const,
    annotations: (queryParams?: GetAnnotationsQueryParams) => ['annotations', queryParams] as const,
}
