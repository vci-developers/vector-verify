import type { GetCollectionCyclesQueryParams } from '@/api/collection-cycle/validation/get-collection-cycles-schema';

export const collectionCycleKeys = {
    root: ['collectionCycles'] as const,
    collectionCycles: (queryParams: GetCollectionCyclesQueryParams) =>
        ['collectionCycles', queryParams] as const,
};
