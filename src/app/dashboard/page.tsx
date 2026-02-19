'use client';

import { useUserProfile } from '@/api/user/hooks/use-user-profile';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react/jsx-runtime';

export default function DashboardPage() {
    const router = useRouter();
    const { data: userProfileResult, isPending } = useUserProfile();

    if (isPending || !userProfileResult) {
        return <h1>LOADING...</h1>;
    }

    if (!userProfileResult.ok) {
        return <h1>ERROR: {userProfileResult.error.message}</h1>;
    }

    if (!userProfileResult.data.user.isWhitelisted) {
        return <h1>NOT WHITELISTED</h1>;
    }

    return (
        <Fragment>
            <Button onClick={() => router.push('/review_new')}>Review</Button>
            <Button onClick={() => router.push('/annotate_new')}>Annotate</Button>
        </Fragment>
    );
}
