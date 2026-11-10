import { useGetPrograms } from '@/api/program/hooks/use-get-programs';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';

const READ_ONLY_REVIEW_COUNTRIES: readonly string[] = ['Kenya'];

export function useIsReviewReadOnly() {
    const { data: getUserPermissionsResult } = useGetUserPermissions();
    const { data: getProgramsResult } = useGetPrograms();

    if (!getUserPermissionsResult?.ok || !getProgramsResult?.ok) {
        return false;
    }

    const { programId } = getUserPermissionsResult.data;
    const userProgram = getProgramsResult.data.programs.find(
        program => program.programId === programId,
    );
    return (
        userProgram !== undefined &&
        READ_ONLY_REVIEW_COUNTRIES.includes(userProgram.country)
    );
}
