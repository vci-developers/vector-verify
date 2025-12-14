
export const GENUS_MORPH_IDS = {
  ANOPHELES: 'Anopheles',
  CULEX: 'Culex',
  AEDES: 'Aedes',
  MANSIONIA: 'Mansonia',
  NON_MOSQUITO: 'Non-Mosquito',
} as const;

export const SPECIES_MORPH_IDS = {
  ANOPHELES_FUNESTUS: ' funestus',
  ANOPHELES_GAMBIAE: ' gambiae',
  ANOPHELES_OTHER: ' other',
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

export const ARTIFACT_MORPH_IDS = {
  BLURRY_IMAGE: 'Blurry Image',
  MISSING_BODY_PARTS: 'Missing Body Parts',
  BAD_POSE: 'Bad Pose',
  MULTIPLE_SPECIMENS: 'Multiple Specimens',
  OTHER: 'Other',
} as const;

export type GenusMorphId = (typeof GENUS_MORPH_IDS)[keyof typeof GENUS_MORPH_IDS];
export type SpeciesMorphId = (typeof SPECIES_MORPH_IDS)[keyof typeof SPECIES_MORPH_IDS];
export type SexMorphId = (typeof SEX_MORPH_IDS)[keyof typeof SEX_MORPH_IDS];
export type AbdomenStatusMorphId =
  (typeof ABDOMEN_STATUS_MORPH_IDS)[keyof typeof ABDOMEN_STATUS_MORPH_IDS];
export type MorphArtifact = (typeof ARTIFACT_MORPH_IDS)[keyof typeof ARTIFACT_MORPH_IDS];
