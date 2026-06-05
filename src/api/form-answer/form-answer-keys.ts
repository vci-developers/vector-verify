export const formAnswerKeys = {
    root: ['formAnswer'] as const,
    formAnswersBySessionId: (sessionId: number, version?: string) =>
        ['formAnswer', 'sessionId', sessionId, version] as const,
};
