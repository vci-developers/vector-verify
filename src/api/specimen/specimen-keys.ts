import type { GetAllSpecimensQueryParams } from '@/api/specimen/validation/get-all-specimens-schema';
import type { GetSpecimensCountQueryParams } from '@/api/specimen/validation/get-specimens-count-schema';
import type { GetSpecimensQueryParams } from '@/api/specimen/validation/get-specimens-schema';

export const specimenKeys = {
    root: ['specimens'] as const,
    specimenById: (specimenId: number) => ['specimens', specimenId] as const,
    specimens: (queryParams?: GetSpecimensQueryParams) =>
        ['specimens', queryParams] as const,
    specimensCount: (queryParams?: GetSpecimensCountQueryParams) =>
        ['specimens', 'count', queryParams] as const,
    allSpecimens: (queryParams: GetAllSpecimensQueryParams) =>
        ['specimens', 'all', queryParams] as const,
};
