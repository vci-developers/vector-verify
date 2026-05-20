export const formAnswerKeys = {
    root: ['formAnswer'] as const,
    formAnswersBySessionId: (sessionId: number) =>
        ['formAnswer', 'sessionId', sessionId] as const,
};
