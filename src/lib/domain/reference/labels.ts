export const SpeciesLabels = {
  ANOPHELES_FUNESTUS: "Anopheles funestus",
  ANOPHELES_GAMBIAE: "Anopheles gambiae",
  ANOPHELES_OTHER: "Anopheles other",
  CULEX: "Culex",
  AEDES: "Aedes",
  MANSONIA: "Mansonia",
  NON_MOSQUITO: "Non Mosquito",
} as const;

export const SexLabels = {
  MALE: "Male",
  FEMALE: "Female",
} as const;

export const AbdomenStatusLabels = {
  UNFED: "Unfed",
  FULLY_FED: "Fully-fed",
  SEMI_GRAVID: "Semi-gravid",
  GRAVID: "Gravid",
} as const;

export type SpeciesLabels = (typeof SpeciesLabels)[keyof typeof SpeciesLabels];
export type SexLabels = (typeof SexLabels)[keyof typeof SexLabels];
export type AbdomenStatusLabels =
  (typeof AbdomenStatusLabels)[keyof typeof AbdomenStatusLabels];
