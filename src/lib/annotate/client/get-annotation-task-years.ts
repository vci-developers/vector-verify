import bff from '@/lib/shared/http/client/bff-client';

export async function getAnnotationTaskYears(): Promise<number[]> {
  return bff<number[]>('/annotations/task/years', {
    method: 'GET',
  });
}
