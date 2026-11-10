import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import { useIsKenyaProgram } from '@/lib/hooks/use-is-kenya-program';

export function useIsReviewReadOnly() {
    const { data: getUserPermissionsResult } = useGetUserPermissions();
    const programId = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.programId
        : undefined;

    return useIsKenyaProgram(programId);
}
