export const surveillanceFormKeys = {
    root: ['surveillanceForm'] as const,
    surveillanceFormBySessionId: (sessionId: number) =>
        ['surveillanceForm', 'sessionId', sessionId] as const,
};
