import { annotationTaskKeys } from '@/api/annotation-task/annotation-task-keys';
import { getAnnotationTasks } from '@/api/annotation-task/get-annotation-tasks';
import type { GetAnnotationTasksResponseBody } from '@/api/annotation-task/validation/get-annotation-tasks-schema';
import AnnotationTasksListClient from '@/features/annotation_new/components/annotation-tasks-list-client';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';

export default async function AnnotatePage() {
    const queryClient = new QueryClient();

    const authorizedGetAnnotationTasksResult =
        await withAuthSession<GetAnnotationTasksResponseBody>(
            async accessToken => {
                const getAnnotationTasksResult =
                    await getAnnotationTasks(accessToken);

                queryClient.setQueryData(
                    annotationTaskKeys.annotationTasks(),
                    getAnnotationTasksResult,
                );
                return getAnnotationTasksResult;
            },
        );

    if (!authorizedGetAnnotationTasksResult.ok) {
        if (authorizedGetAnnotationTasksResult.error.kind === 'unauthorized') {
            redirect('/login_new');
        }
        if (authorizedGetAnnotationTasksResult.error.kind === 'forbidden') {
            return <h1>FORBIDDEN</h1>;
        }
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <AnnotationTasksListClient />
        </HydrationBoundary>
    );
}
