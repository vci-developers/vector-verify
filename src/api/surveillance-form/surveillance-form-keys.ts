export const surveillanceFormKeys = {
    root: ['surveillanceForm'] as const,
    surveillanceFormBySessionId: (sessionId: number) =>
        ['surveillanceForm', 'sessionId', sessionId] as const,
    allSurveillanceForms: (queryParams: { sessionId: number[] }) =>
        [
            'surveillanceForm',
            'all',
            { sessionId: queryParams.sessionId.toSorted() },
        ] as const,
};
