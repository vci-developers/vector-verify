import type { GetAnnotationsQueryParams } from "@/api/annotation/validation/get-annotations-schema";

export const annotationKeys = {
    annotations: (queryPrams?: GetAnnotationsQueryParams) => ['annotations', queryPrams] as const,
}
