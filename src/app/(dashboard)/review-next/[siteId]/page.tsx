import { getAllSessions } from '@/api/session/get-all-sessions';
import { sessionKeys } from '@/api/session/session-keys';
import type { GetAllSessionsQueryParams } from '@/api/session/validation/get-all-sessions-schema';
import ReviewWorkspacePageClient from '@/features/review/workspace/components/review-workspace-page-client';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';

interface ReviewWorkspacePageProps {
    params: Promise<{ siteId: string }>;
    searchParams: Promise<{
        startDate?: string;
        endDate?: string;
        collectionCycleId?: string;
        timezone?: string;
    }>;
}

export default async function ReviewWorkspacePage({
    params,
    searchParams,
}: ReviewWorkspacePageProps) {
    const siteId = Number((await params).siteId);
    const {
        startDate,
        endDate,
        collectionCycleId: collectionCycleIdParam,
    } = await searchParams;

    const collectionCycleId: number | undefined =
        collectionCycleIdParam === undefined
            ? undefined
            : Number(collectionCycleIdParam);

    const queryClient = new QueryClient();

    const getAllSessionsQueryParams: GetAllSessionsQueryParams =
        collectionCycleId !== undefined
            ? { siteIds: [siteId], collectionCycleId, type: 'SURVEILLANCE' }
            : { siteIds: [siteId], startDate, endDate, type: 'SURVEILLANCE' };

    const authorizedGetAllSessionsResult = await withAuthSession(
        async accessToken => {
            const getAllSessionsResult = await getAllSessions(
                accessToken,
                getAllSessionsQueryParams,
            );

            queryClient.setQueryData(
                sessionKeys.allSessions(getAllSessionsQueryParams),
                getAllSessionsResult,
            );

            return getAllSessionsResult;
        },
    );

    if (!authorizedGetAllSessionsResult.ok) {
        if (authorizedGetAllSessionsResult.error.kind === 'unauthorized') {
            redirect('/login');
        }
        if (authorizedGetAllSessionsResult.error.kind === 'forbidden') {
            redirect('/forbidden');
        }
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ReviewWorkspacePageClient
                siteId={siteId}
                startDate={startDate}
                endDate={endDate}
                collectionCycleId={collectionCycleId}
            />
        </HydrationBoundary>
    );
}
