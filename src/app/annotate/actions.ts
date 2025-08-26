"use server";

import { apiRequest } from "@/lib/data";

export type AnnotationActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function resolveTaskIdFromSlugAction(
  slug: string
): Promise<AnnotationActionResult<{ taskId: number }>> {
  const cleanedSlug = slug.trim();
  if (cleanedSlug.length === 0) {
    return { ok: false, message: "Missing task slug." };
  }

  if (!/^\d+$/.test(cleanedSlug)) {
    return { ok: false, message: "Invalid task slug. Expected a numeric ID." };
  }

  const taskId = Number(cleanedSlug);
  if (!Number.isSafeInteger(taskId)) {
    return { ok: false, message: "Task ID is out of range." };
  }

  return { ok: true, data: { taskId } };
}

export async function getAnnotationTaskAction(taskId: number): AnnotationActionResult<AnnotationTask> {

}
