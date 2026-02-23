export const surveillanceFormKeys = {
    surveillanceFormBySessionId: (sessionId: number) =>
        ['surveillanceForm', 'sessionId', sessionId] as const,
};
