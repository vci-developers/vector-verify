import { z } from 'zod';

export const molecularSpeciesFormSchema = z.object({
    molecularSpecies: z.string().trim().max(255),
});

export type MolecularSpeciesFormInput = z.infer<
    typeof molecularSpeciesFormSchema
>;
