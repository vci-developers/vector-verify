import type { GetGeocodeQueryParams } from './validation/get-geocode-schema';

export const geocodeKeys = {
    root: ['geocode'] as const,
    geocode: (queryParams: GetGeocodeQueryParams) =>
        ['geocode', queryParams] as const,
};
