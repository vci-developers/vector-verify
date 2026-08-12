import { useGetPrograms } from '@/api/program/hooks/use-get-programs';

export function useIsUgandaProgram(programId: number | undefined) {
    const { data: getUgandaProgramsResult } = useGetPrograms({
        country: 'Uganda',
    });

    return (
        getUgandaProgramsResult?.ok === true &&
        getUgandaProgramsResult.data.programs.some(
            program => program.programId === programId,
        )
    );
}
