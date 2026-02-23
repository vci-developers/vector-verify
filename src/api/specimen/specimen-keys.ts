import type { GetSpecimensQueryParams } from '@/api/specimen/validation/get-specimens-schema';

export const specimenKeys = {
    specimens: (queryParams?: GetSpecimensQueryParams) =>
        ['specimens', queryParams] as const,
};
