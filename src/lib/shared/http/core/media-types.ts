export const MEDIA_TYPE = {
  JSON: 'application/json',
  EVENT_STREAM: 'text/event-stream',
} as const;

export type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];
