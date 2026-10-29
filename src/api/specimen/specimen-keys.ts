import type { GetAllSpecimensQueryParams } from '@/api/specimen/validation/get-all-specimens-schema';
import type { GetSpecimensCountQueryParams } from '@/api/specimen/validation/get-specimens-count-schema';
import type { GetSpecimensQueryParams } from '@/api/specimen/validation/get-specimens-schema';
import type { GetMonthlySpecimensCountQueryParams } from './validation/get-monthly-specimens-count-schema';

export const specimenKeys = {
    root: ['specimens'] as const,
    specimens: (queryParams?: GetSpecimensQueryParams) =>
        ['specimens', queryParams] as const,
    specimensCount: (queryParams?: GetSpecimensCountQueryParams) =>
        ['specimens', 'count', queryParams] as const,
    monthlySpecimensCount: (
        queryParams?: GetMonthlySpecimensCountQueryParams,
    ) => ['specimens', 'count', 'monthly', queryParams] as const,
    allSpecimens: (queryParams: GetAllSpecimensQueryParams) =>
        ['specimens', 'all', queryParams] as const,
};
