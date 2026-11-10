import { useGetPrograms } from '@/api/program/hooks/use-get-programs';

export function useIsKenyaProgram(programId: number | undefined) {
    const { data: getKenyaProgramsResult } = useGetPrograms({
        country: 'Kenya',
    });

    return (
        getKenyaProgramsResult?.ok === true &&
        getKenyaProgramsResult.data.programs.some(
            program => program.programId === programId,
        )
    );
}
