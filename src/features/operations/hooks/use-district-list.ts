'use client';

import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';

export interface DistrictInfo {
    district: string;
    siteCount: number;
}

interface UseDistrictListResult {
    districts: DistrictInfo[];
    isPending: boolean;
    isError: boolean;
}

export function useDistrictList(): UseDistrictListResult {
    const { data: permissionsResult, isPending } = useGetUserPermissions();

    if (isPending || !permissionsResult) {
        return { districts: [], isPending: true, isError: false };
    }

    if (!permissionsResult.ok) {
        return { districts: [], isPending: false, isError: true };
    }

    const sites = permissionsResult.data.permissions.sites.canAccessSites;
    const districtMap = new Map<string, number>();

    for (const site of sites) {
        if (!site.district) continue;
        districtMap.set(
            site.district,
            (districtMap.get(site.district) ?? 0) + 1,
        );
    }

    const districts = Array.from(districtMap.entries()).map(
        ([district, siteCount]) => ({ district, siteCount }),
    );

    return { districts, isPending: false, isError: false };
}
