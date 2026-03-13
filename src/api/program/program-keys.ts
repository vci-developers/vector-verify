import type { GetProgramsQueryParams } from '@/api/program/validation/get-programs-schema';

export const programKeys = {
    root: ['programs'] as const,
    programById: (programId: number) => ['programs', programId] as const,
    programs: (queryParams?: GetProgramsQueryParams) =>
        ['programs', queryParams] as const,
};
