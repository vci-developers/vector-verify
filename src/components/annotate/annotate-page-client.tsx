'use client';

import { useAnnotationTasksQuery } from '@/lib/annotate/client';

export function AnnotatePageClient() {
  useAnnotationTasksQuery({ page: 1, limit: 20 });

  return <div className="container mx-auto px-4 py-6" />;
}
