import { sessionKeys } from '@/api/session/session-keys';
import { getSessions } from '@/api/session/get-sessions';
import type { GetSessionsQueryParams } from '@/api/session/validation/get-sessions-schema';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { endOfMonth, format, parseISO } from 'date-fns';
import { redirect } from 'next/navigation';
import SurveillanceFormReviewPageClient from '@/features/review/components/site-detail/surveillance-form-review/page-client/surveillance-form-review-page-client';

interface ReviewSiteDetailPageProps {
    params: Promise<{
        siteId: string;
    }>;
    searchParams: Promise<{
        month?: string;
    }>;
}

export default async function ReviewSiteDetailPage({
    params,
    searchParams,
}: ReviewSiteDetailPageProps) {
    const { siteId: siteIdParam } = await params;
    const { month } = await searchParams;
    const siteId = Number(siteIdParam);
    const queryClient = new QueryClient();

    const startDate = month;
    const endDate = month
        ? format(endOfMonth(parseISO(month)), 'yyyy-MM-dd')
        : undefined;

    const getSessionsQueryParams: GetSessionsQueryParams = {
        siteId,
        startDate,
        endDate,
    };

    const authorizedGetSessionsResult = await withAuthSession(
        async accessToken => {
            const getSessionsResult = await getSessions(
                accessToken,
                getSessionsQueryParams,
            );

            queryClient.setQueryData(
                sessionKeys.sessions(getSessionsQueryParams),
                getSessionsResult,
            );
            return getSessionsResult;
        },
    );

    if (!authorizedGetSessionsResult.ok) {
        if (authorizedGetSessionsResult.error.kind === 'unauthorized') {
            redirect('/login');
        }
        if (authorizedGetSessionsResult.error.kind === 'forbidden') {
            redirect('/forbidden');
        }
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <SurveillanceFormReviewPageClient
                siteId={siteId}
                startDate={startDate}
                endDate={endDate}
            />
        </HydrationBoundary>
    );
}
