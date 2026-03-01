'use client';

import { useGetAnnotationTasks } from '@/api/annotation-task/hooks/use-get-annotation-tasks';

export default function AnnotationTasksList() {
    const { data: annotationTasksResult, isPending: isAnnotationTasksPending } =
        useGetAnnotationTasks();

    if (isAnnotationTasksPending || !annotationTasksResult) {
        return <h1>LOADING...</h1>;
    }

    if (!annotationTasksResult.ok) {
        return <h1>ERROR: {annotationTasksResult.error.message}</h1>;
    }

    const annotationTasks = annotationTasksResult.data.tasks;

    return annotationTasks.map(task => <h1 key={task.id}>{task.title}</h1>);
}
