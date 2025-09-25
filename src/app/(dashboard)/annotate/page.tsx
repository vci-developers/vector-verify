import { Suspense } from 'react';
import { AnnotationTasksListPageClient } from '@/components/annotate/tasks-list/page-client';
import { AnnotationTasksListLoadingSkeleton } from '@/components/annotate/tasks-list/loading-skeleton';

export default function AnnotatePage() {
  return (
    <Suspense fallback={<AnnotationTasksListLoadingSkeleton />}>
      <AnnotationTasksListPageClient />
    </Suspense>
  );
}
