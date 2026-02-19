'use client';

import { useUserPermissions } from '@/api/user/hooks/use-user-permissions';

export default function DashboardPage() {
    const { data, isPending } = useUserPermissions();

    if (isPending || !data) {
        return <h1>LOADING...</h1>;
    }

    if (!data.ok) {
        if (data.error.kind === 'unauthorized') return <h1>UNAUTHORIZED</h1>;
        return <h1>ERROR: {data.error.message}</h1>;
    }

    return <h1>ENTERED SUCCESSFULLY</h1>;
}
