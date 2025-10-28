import bff from '@/shared/infra/api/bff-client';
import { mapSurveillanceFormDtoToModel } from '@/shared/entities/surveillance-form/mapper';
import type { SurveillanceForm } from '@/shared/entities/surveillance-form/model';
import type { SurveillanceFormDto } from '@/shared/entities/surveillance-form/dto';
import { HttpError, HTTP_STATUS } from '@/shared/infra/http/core';

export async function getSurveillanceForm(
  sessionId: number,
): Promise<SurveillanceForm | null> {
  try {
    const dto = await bff<SurveillanceFormDto>(
      `/sessions/${sessionId}/survey`,
      {
        method: 'GET',
      },
    );
    return mapSurveillanceFormDtoToModel(dto);
  } catch (error) {
    if (
      error instanceof HttpError &&
      error.status === HTTP_STATUS.NOT_FOUND
    ) {
      return null;
    }

    throw error;
  }
}

export async function getSurveillanceFormsForSessions(
  sessionIds: number[],
): Promise<Map<number, SurveillanceForm>> {
  const results = await Promise.all(
    sessionIds.map(async sessionId => {
      const form = await getSurveillanceForm(sessionId);
      return { sessionId, form };
    }),
  );

  const formsMap = new Map<number, SurveillanceForm>();
  results.forEach(({ sessionId, form }) => {
    if (form) {
      formsMap.set(sessionId, form);
    }
  });

  return formsMap;
}
