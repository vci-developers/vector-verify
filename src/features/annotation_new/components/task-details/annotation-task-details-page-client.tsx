'use client'

interface AnnotationTaskDetailsPageClientProps {
    taskId: number;
}

export default function AnnotationTaskDetailsPageClient({
    taskId,
}: AnnotationTaskDetailsPageClientProps) {
    return <div>Task ID: {taskId}</div>;
}
