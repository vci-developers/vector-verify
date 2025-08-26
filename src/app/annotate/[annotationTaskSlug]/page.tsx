import { AnnotationTaskClient } from "@/feature/annotate/task/components/annotation-task-client";
import { DUMMY_ANNOTATION_TASKS } from "@/lib/dummy-annotation-tasks";
import { notFound } from "next/navigation";
import { resolveTaskIdFromSlugAction } from "../actions";

interface AnnotationTaskPageProps {
  params: Promise<{
    annotationTaskSlug: string;
  }>;
}

export default async function AnnotationTaskPage({
  params,
}: AnnotationTaskPageProps) {
  const { annotationTaskSlug } = await params;
  const result = await resolveTaskIdFromSlugAction(annotationTaskSlug);
  if (!result.ok) notFound();

  const task = DUMMY_ANNOTATION_TASKS.find((t) => t.id === result.data.taskId);
  if (!task) notFound();

  return <AnnotationTaskClient task={task} />;
}
