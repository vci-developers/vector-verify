import type { z } from 'zod';

type QueryValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | Array<string | number | boolean | null | undefined>;

export function constructQueryString<T extends Record<string, QueryValue>>(
    queryParams?: T,
    contract?: z.ZodType<T>,
): string {
    if (!queryParams || !contract) return '';

    const params = contract.safeParse(queryParams);
    if (!params.success) {
        throw new Error(`Invalid query parameters: ${params.error.message}`);
    }

    const searchParams = new URLSearchParams();

    Object.entries(params.data).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) {
            const filteredArray = value.filter(
                item => item !== undefined && item !== null && item !== '',
            );
            if (filteredArray.length > 0) {
                searchParams.set(key, filteredArray.map(String).join(','));
            }
            return;
        }

        searchParams.set(key, String(value));
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}
