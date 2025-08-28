"use server";

import {
  DUMMY_ANNOTATION_TASKS,
  DUMMY_ANNOTATIONS,
  DUMMY_SPECIMENS,
  DUMMY_SESSIONS,
} from "@/lib/dummy-data";
import type { AnnotationDto } from "@/lib/data/dto/annotation-dto";
import type { AnnotationTaskDto } from "@/lib/data/dto/annotation-task-dto";
import type { SpecimenDto } from "@/lib/data/dto/specimen-dto";
import type { SessionDto } from "@/lib/data/dto/session-dto";
import { API_BASE_URL, apiRequest } from "@/lib/data";
import { AnnotationTaskWithEntriesDto } from "@/lib/data/dto/composites/annotation-task-with-entries-dto";

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
    return { ok: false, message: "Invalid task ID." };
  }

  return { ok: true, data: { taskId } };
}

export async function getAnnotationTaskListAction(): Promise<
  AnnotationActionResult<{ taskWithEntriesList: AnnotationTaskWithEntriesDto[]}>
> {
  try {
    // ─────────────────────────────────────────────────────────────
    // ▶ REPLACE WITH API — Option A (single consolidated endpoint)
    // const apiData = await apiRequest<AnnotationTaskWithEntriesDto[]>(
    //   `/v1/annotation-tasks:withEntries`, // e.g., consolidated list endpoint
    //   { method: "GET", timeoutMs: 15_000 }
    // );
    // return { ok: true, data: apiData };
    // ─────────────────────────────────────────────────────────────

    // Build lookup maps once
    const specimensById = new Map<number, SpecimenDto>(
      DUMMY_SPECIMENS.map((s: SpecimenDto) => [s.id, s])
    );
    const sessionsById = new Map<number, SessionDto>(
      DUMMY_SESSIONS.map((s: SessionDto) => [s.sessionId, s])
    );

    // Group annotations by taskId
    const annotationsByTaskId = new Map<number, AnnotationDto[]>();
    for (const a of DUMMY_ANNOTATIONS) {
      const bucket = annotationsByTaskId.get(a.taskId);
      if (bucket) bucket.push(a);
      else annotationsByTaskId.set(a.taskId, [a]);
    }

    // Join per task
    const taskWithEntriesList: AnnotationTaskWithEntriesDto[] = DUMMY_ANNOTATION_TASKS.map(
      (t: AnnotationTaskDto) => {
        const taskAnnotations = annotationsByTaskId.get(t.id) ?? [];

        const entries: AnnotationTaskWithEntriesDto["entries"] = taskAnnotations.map((a) => {
          const specimen = specimensById.get(a.specimenId);
          if (!specimen) {
            throw new Error(`Specimen ${a.specimenId} missing for task ${t.id}`);
          }
          const session = sessionsById.get(specimen.sessionId);
          if (!session) {
            throw new Error(`Session ${specimen.sessionId} missing for specimen ${specimen.id}`);
          }
          return { annotation: a, specimen, session };
        });

        return { ...t, entries };
      }
    );

    // simulate latency for realism
    await new Promise((r) => setTimeout(r, 2000));

    return { ok: true, data: { taskWithEntriesList } };
  } catch {
    return { ok: false, message: "Failed to load annotation tasks." };
  }
}

export async function getAnnotationTaskAction(
  taskId: number
): Promise<AnnotationActionResult<{ taskWithEntries: AnnotationTaskWithEntriesDto }>> {
  if (!Number.isSafeInteger(taskId)) {
    return { ok: false, message: "Invalid task ID." };
  }

  try {
    // ─────────────────────────────────────────────────────────────
    // ▶ REPLACE WITH API — Option A (single consolidated endpoint)
    // const apiData = await apiRequest<AnnotationTaskWithEntriesDto>(
    //   `/v1/annotation-tasks/${taskId}/entries`,
    //   { method: "GET", timeoutMs: 15_000 }
    // );
    // return { ok: true, data: apiData };
    // ─────────────────────────────────────────────────────────────

    // ─────────────────────────────────────────────────────────────
    // ▶ REPLACE WITH API — Option B (fetch parts & join on server)
    // const [task, annotations] = await Promise.all([
    //   apiRequest<AnnotationTaskDto>(`/v1/annotation-tasks/${taskId}`, { method: "GET", timeoutMs: 15_000 }),
    //   apiRequest<AnnotationDto[]>(`/v1/annotation-tasks/${taskId}/annotations`, { method: "GET", timeoutMs: 15_000 }),
    // ]);
    // const specimenIds = Array.from(new Set(annotations.map(a => a.specimenId)));
    // const specimens = await apiRequest<SpecimenDto[]>(`/v1/specimens:batchGet`, { method: "POST", body: { ids: specimenIds }, timeoutMs: 15_000 });
    // const sessionIds = Array.from(new Set(specimens.map(s => s.sessionId)));
    // const sessions  = await apiRequest<SessionDto[]>(`/v1/sessions:batchGet`,  { method: "POST", body: { ids: sessionIds },  timeoutMs: 15_000 });
    // const specimensById = new Map(specimens.map(s => [s.id, s]));
    // const sessionsById  = new Map(sessions.map(s => [s.sessionId, s]));
    // const entries = annotations.map(a => {
    //   const specimen = specimensById.get(a.specimenId)!;
    //   const session  = sessionsById.get(specimen.sessionId)!;
    //   return { annotation: a, specimen, session };
    // });
    // return { ok: true, data: { ...task, entries } };
    // ─────────────────────────────────────────────────────────────

    // TEMP: dummy join until API is wired
    const task = DUMMY_ANNOTATION_TASKS.find(
      (task: AnnotationTaskDto) => task.id === taskId
    );
    if (!task) return { ok: false, message: "Task not found." };

    const specimensById = new Map<number, SpecimenDto>(
      DUMMY_SPECIMENS.map((s: SpecimenDto) => [s.id, {...s, thumbnailUrl: API_BASE_URL + s.thumbnailUrl}])
    );

    const sessionsById = new Map<number, SessionDto>(
      DUMMY_SESSIONS.map((s: SessionDto) => [s.sessionId, s])
    );

    const annotations = DUMMY_ANNOTATIONS.filter(
      (annotation: AnnotationDto) => annotation.taskId === taskId
    );

    const entries: AnnotationTaskWithEntriesDto["entries"] = annotations.map(
      (annotation: AnnotationDto) => {
        const specimen = specimensById.get(annotation.specimenId);
        if (!specimen)
          throw new Error(
            `Specimen ${annotation.specimenId} missing for task ${taskId}`
          );
        const session = sessionsById.get(specimen.sessionId);
        if (!session)
          throw new Error(
            `Session ${specimen.sessionId} missing for specimen ${specimen.id}`
          );
        return { annotation, specimen, session };
      }
    );

    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    return { ok: true, data: { taskWithEntries: { ...task, entries } } };
  } catch (error) {
    return { ok: false, message: "Failed to build task entries." };
  }
}
