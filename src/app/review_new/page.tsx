'use client';

import { useUserPermissions } from '@/api/user/hooks/use-user-permissions';
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
    const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(
        undefined,
    );
    const { data: userPermissionsResult, isPending: isUserPermissionsPending } =
        useUserPermissions();

    if (isUserPermissionsPending || !userPermissionsResult) {
        return <h1>LOADING...</h1>;
    }

    if (!userPermissionsResult.ok) {
        return <h1>ERROR: {userPermissionsResult.error.message}</h1>;
    }

    const userPermissions: UserPermissions = userPermissionsResult.data.permissions;
    const districts = [
        ...new Set(
            userPermissions.sites.canAccessSites
                .map(site => site.district?.trim())
                .filter((district): district is string => Boolean(district)),
        ),
    ].sort();

    return (
        <Fragment>
            <Select onValueChange={setSelectedDistrict} value={selectedDistrict}>
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
            <Button disabled={!selectedDistrict} onClick={() => {
                if (selectedDistrict) {
                    router.push(`/review_new/${encodeURIComponent(selectedDistrict)}`);
                }
            }}>
                View Data
            </Button>
        </Fragment>
    );
}
