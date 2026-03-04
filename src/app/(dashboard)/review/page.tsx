'use client';

import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import type { UserPermissions } from '@/api/user/validation/user-permissions-schema';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';

export default function ReviewPage() {
    const router = useRouter();
    const [selectedDistrict, setSelectedDistrict] = useState<
        string | undefined
    >(undefined);
    const {
        data: getUserPermissionsResult,
        isPending: isGetUserPermissionsPending,
    } = useGetUserPermissions();

    if (isGetUserPermissionsPending || !getUserPermissionsResult) {
        return <h1>LOADING...</h1>;
    }

    if (!getUserPermissionsResult.ok) {
        return <h1>ERROR: {getUserPermissionsResult.error.message}</h1>;
    }

    const userPermissions: UserPermissions =
        getUserPermissionsResult.data.permissions;
    const districts = [
        ...new Set(
            userPermissions.sites.canAccessSites
                .map(site => site.district?.trim())
                .filter((district): district is string => Boolean(district)),
        ),
    ].sort();

    return (
        <Fragment>
            <Select
                onValueChange={setSelectedDistrict}
                value={selectedDistrict}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Select a district to review" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Accessible Sites</SelectLabel>
                        {districts.map(district => (
                            <SelectItem key={district} value={district}>
                                {district}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Button
                disabled={!selectedDistrict}
                onClick={() => {
                    if (selectedDistrict) {
                        router.push(
                            `/review/${encodeURIComponent(selectedDistrict)}`,
                        );
                    }
                }}
            >
                View Data
            </Button>
        </Fragment>
    );
}
