export const formKeys = {
    root: ['forms'] as const,
    currentFormByProgramId: (programId: number) =>
        ['forms', programId, 'current'] as const,
    formByVersion: (programId: number, version: string) =>
        ['forms', programId, version] as const,
};
