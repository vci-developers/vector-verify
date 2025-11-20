export const SPECIES_MORPH_IDS = {
  ANOPHELES_FUNESTUS: 'Anopheles funestus',
  ANOPHELES_GAMBIAE: 'Anopheles gambiae',
  ANOPHELES_OTHER: 'Anopheles other',
  CULEX: 'Culex',
  AEDES: 'Aedes',
  MANSIONIA: 'Mansonia',
  NON_MOSQUITO: 'Non-Mosquito',
  CANNOT_BE_DETERMINED: 'Cannot be determined',
} as const;

export const SEX_MORPH_IDS = {
  MALE: 'Male',
  FEMALE: 'Female',
} as const;

export const ABDOMEN_STATUS_MORPH_IDS = {
  UNFED: 'Unfed',
  FULLY_FED: 'Fully Fed',
  GRAVID: 'Gravid',
} as const;

export type SpeciesMorphId = (typeof SPECIES_MORPH_IDS)[keyof typeof SPECIES_MORPH_IDS];
export type SexMorphId = (typeof SEX_MORPH_IDS)[keyof typeof SEX_MORPH_IDS];
export type AbdomenStatusMorphId =
  (typeof ABDOMEN_STATUS_MORPH_IDS)[keyof typeof ABDOMEN_STATUS_MORPH_IDS];
