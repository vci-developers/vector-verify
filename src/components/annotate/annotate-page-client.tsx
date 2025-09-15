'use client';

import { useAnnotationTasksQuery } from '@/lib/annotate/client';
import { usePagination } from '@/lib/shared/hooks/use-pagination';

export function AnnotatePageClient() {
  const { data } = useAnnotationTasksQuery({});

  const items = data?.items ?? [];
  const total = items.length;
  const pagination = usePagination({ total, initialPage: 1, initialPageSize: 20 });
  const pageItems = pagination.slice(items);

  return (
    <div className="container mx-auto px-4 py-6" />
  )
}
