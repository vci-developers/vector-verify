import { useGetPrograms } from '@/api/program/hooks/use-get-programs';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';

const READ_ONLY_REVIEW_COUNTRIES: readonly string[] = ['Kenya'];

export type ReviewAccess = 'loading' | 'read-only' | 'writable' | 'error';

export function useReviewAccess(): ReviewAccess {
    const getUserPermissionsQuery = useGetUserPermissions();
    const getProgramsQuery = useGetPrograms();

    if (getUserPermissionsQuery.isPending || getProgramsQuery.isPending) {
        return 'loading';
    }

    const getUserPermissionsResult = getUserPermissionsQuery.data;
    const getProgramsResult = getProgramsQuery.data;
    if (!getUserPermissionsResult?.ok || !getProgramsResult?.ok) {
        return 'error';
    }

    const { programId } = getUserPermissionsResult.data;
    const userProgram = getProgramsResult.data.programs.find(
        program => program.programId === programId,
    );
    if (userProgram === undefined) {
        return 'error';
    }

    return READ_ONLY_REVIEW_COUNTRIES.includes(userProgram.country)
        ? 'read-only'
        : 'writable';
}
