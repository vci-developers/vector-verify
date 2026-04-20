import { z } from "zod";

export const geocodeSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
});

export type Geocode = z.infer<typeof geocodeSchema>;
