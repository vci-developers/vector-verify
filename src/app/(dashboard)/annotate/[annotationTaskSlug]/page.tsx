import { notFound } from 'next/navigation';
import { AnnotationTaskDetailPageClient } from '@/features/annotation';

interface AnnotationTaskPageProps {
  params: Promise<{ annotationTaskSlug: string }>;
}

function extractTaskId(slug: string): number | null {
  const match = slug.match(/\d+/);
  if (!match) return null;
  const id = Number.parseInt(match[0], 10);
  return Number.isFinite(id) ? id : null;
}

export default async function AnnotationTaskPage({
  params,
}: AnnotationTaskPageProps) {
  
  const { annotationTaskSlug } = await params;
  const taskId = extractTaskId(annotationTaskSlug);

  if (!taskId) {
    notFound();
  }

  return <AnnotationTaskDetailPageClient taskId={taskId} />;
}
