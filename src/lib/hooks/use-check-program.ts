'use client';

import { useGetPrograms } from '@/api/program/hooks/use-get-programs';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const UGANDA_ONLY_PATHS = ['/', '/review', '/annotate'];

export function useCheckProgram() {
    const pathname = usePathname();
    const router = useRouter();

    const { data: getUserPermissionsResult } = useGetUserPermissions();

    const programId = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.programId
        : undefined;

    const { data: getProgramsResult } = useGetPrograms(
        { programId },
        { enabled: programId !== undefined },
    );

    const country = getProgramsResult?.ok
        ? (getProgramsResult.data.programs.find(
              program => program.programId === programId,
          )?.country ?? null)
        : null;

    const isUganda = country?.toLowerCase() === 'uganda';
    const isProgramOk = getProgramsResult?.ok === true;

    useEffect(() => {
        if (
            isProgramOk &&
            !isUganda &&
            UGANDA_ONLY_PATHS.some(
                path => path === pathname || pathname.startsWith(path + '/'),
            )
        ) {
            router.replace('/operations');
        }
    }, [isProgramOk, isUganda, pathname, router]);

    return { country, isUganda, isProgramOk };
}
