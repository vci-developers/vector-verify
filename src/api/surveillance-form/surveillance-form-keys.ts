export const surveillanceFormKeys = {
    root: ['surveillanceForm'] as const,
    surveillanceFormBySessionId: (sessionId: number) =>
        ['surveillanceForm', 'sessionId', sessionId] as const,
    allSurveillanceForms: (sessionIds: number[]) =>
        ['surveillanceForm', 'all', sessionIds] as const,
};
