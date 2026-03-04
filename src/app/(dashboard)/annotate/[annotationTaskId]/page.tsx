import { annotationKeys } from '@/api/annotation/annotation-keys';
import { getAnnotations } from '@/api/annotation/get-annotations';
import type {
    GetAnnotationsResponseBody,
    GetAnnotationsQueryParams,
} from '@/api/annotation/validation/get-annotations-schema';
import AnnotationTaskDetailsPageClient from '@/features/annotation/components/task-details/page-client/annotation-task-details-page-client';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';

interface AnnotationTaskDetailsPageProps {
    params: Promise<{
        annotationTaskId: string;
    }>;
}

export default async function AnnotationTaskDetailsPage({
    params,
}: AnnotationTaskDetailsPageProps) {
    const annotationTaskId = Number((await params).annotationTaskId);
    const queryClient = new QueryClient();

    const getPendingAnnotationsQueryParams: GetAnnotationsQueryParams = {
        taskId: annotationTaskId,
        status: 'PENDING' as const,
        page: 1,
        limit: 1,
    };

    const authorizedGetPendingAnnotationsResult =
        await withAuthSession<GetAnnotationsResponseBody>(async accessToken => {
            const getPendingAnnotationsResult = await getAnnotations(
                accessToken,
                getPendingAnnotationsQueryParams,
            );

            queryClient.setQueryData(
                annotationKeys.annotations(getPendingAnnotationsQueryParams),
                getPendingAnnotationsResult,
            );
            return getPendingAnnotationsResult;
        });

    if (!authorizedGetPendingAnnotationsResult.ok) {
        if (
            authorizedGetPendingAnnotationsResult.error.kind === 'unauthorized'
        ) {
            redirect('/login');
        }
        if (authorizedGetPendingAnnotationsResult.error.kind === 'forbidden') {
            return <h1>FORBIDDEN</h1>;
        }
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AnnotationTaskDetailsPageClient taskId={annotationTaskId} />
        </HydrationBoundary>
    );
}
