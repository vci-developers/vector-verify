import type { GeocodeQueryParams } from './validation/get-geocode-schema';

export const geocodeKeys = {
    root: ['geocode'] as const,
    geocode: (queryParams: GeocodeQueryParams) =>
        ['geocode', queryParams] as const,
};
