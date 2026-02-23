import type { GetSpecimensQueryParams } from '@/api/specimen/validation/get-specimens-schema';

export const specimenKeys = {
    specimenById: (specimenId: number) => ['specimens', specimenId] as const,
    specimens: (queryParams?: GetSpecimensQueryParams) =>
        ['specimens', queryParams] as const,
};
