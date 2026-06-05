export const formAnswerKeys = {
    root: ['formAnswer'] as const,
    formAnswersBySessionId: (sessionId: number, version?: string) =>
        version !== undefined
            ? (['formAnswer', 'sessionId', sessionId, version] as const)
            : (['formAnswer', 'sessionId', sessionId] as const),
};
