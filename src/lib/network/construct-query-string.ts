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
        return '';
    }

    const searchParams = new URLSearchParams();

    Object.entries(params.data).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value)) {
            value.forEach(entry => {
                if (entry === undefined || entry === null || entry === '')
                    return;
                searchParams.append(key, String(entry));
            });
            return;
        }

        searchParams.set(key, String(value));
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}
