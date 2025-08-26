export const SessionType = {
  SURVEILLANCE: "SURVEILLANCE",
  DATA_COLLECTION: "DATA_COLLECTION",
} as const;

export type SessionType = (typeof SessionType)[keyof typeof SessionType];
