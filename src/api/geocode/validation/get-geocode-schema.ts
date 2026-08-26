import { z } from 'zod';
import { geocodeSchema } from './geocode-schema';

export const getGeocodeQueryParamsSchema = z.object({
    location: z.string(),
    country: z.string().optional(),
});

export const getGeocodeResponseSchema = geocodeSchema;

export type GetGeocodeQueryParams = z.infer<typeof getGeocodeQueryParamsSchema>;

export type GetGeocodeResponseBody = z.infer<typeof getGeocodeResponseSchema>;
export type GetGeocodeSuccessPayload = GetGeocodeResponseBody;
