export const resourcesKeys = {
    root: ['resources'] as const,
    sign: (path: string) => ['resources', 'sign', path] as const,
};
