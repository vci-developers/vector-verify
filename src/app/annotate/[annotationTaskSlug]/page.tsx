import { AnnotationTaskClient } from "@/feature/annotate/task/components/annotation-task-client";
import { DUMMY_ANNOTATION_TASKS } from "@/lib/dummy-data";
import { notFound } from "next/navigation";
import { getAnnotationTaskAction, resolveTaskIdFromSlugAction } from "../actions";

interface AnnotationTaskPageProps {
  params: Promise<{
    annotationTaskSlug: string;
  }>;
}

export default async function AnnotationTaskPage({
  params,
}: AnnotationTaskPageProps) {
  const { annotationTaskSlug } = await params;
  const taskIdResult = await resolveTaskIdFromSlugAction(annotationTaskSlug);
  if (!taskIdResult.ok) notFound();

  const taskId = taskIdResult.data.taskId;
  const taskWithEntriesResult = await getAnnotationTaskAction(taskId);
  if (!taskWithEntriesResult.ok) notFound();

  const taskWithEntries = taskWithEntriesResult.data.taskWithEntries;
  if (!taskWithEntries) notFound();

  return <AnnotationTaskClient taskWithEntries={taskWithEntries} />;
}
