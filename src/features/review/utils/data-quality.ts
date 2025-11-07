import type { SessionsBySite } from '@/features/review/hooks/use-sessions-by-site';
import type { DiscrepancyField, DiscrepancyFieldKey } from '@/features/review/types';
import type { SurveillanceForm } from '@/shared/entities/surveillance-form/model';

const uniqueNonNull = <T,>(values: (T | null | undefined)[]) =>
  Array.from(
    new Set(values.filter((value): value is T => value !== null && value !== undefined)),
  );

const uniqueStringValues = (values: (string | null | undefined)[]) =>
  Array.from(
    new Set(
      values
        .map(value => (typeof value === 'string' ? value.trim() : value))
        .filter((value): value is string => Boolean(value && value.length > 0)),
    ),
  );

const formatValueList = (values: (string | number | boolean)[]) =>
  values.length === 0
    ? 'Not recorded'
    : values
        .map(value => {
          if (typeof value === 'boolean') return value ? 'Yes' : 'No';
          if (typeof value === 'number') return `${value}`;
          return value;
        })
        .join(' • ');

const formatMonthsSinceIrsConflict = (forms: SurveillanceForm[]) => {
  const segments: string[] = [];
  const yesValues = uniqueNonNull(
    forms
      .filter(f => f.wasIrsConducted === true)
      .map(f => f.monthsSinceIrs),
  );

  if (forms.some(f => f.wasIrsConducted === true)) {
    segments.push(
      yesValues.length === 0
        ? 'Yes: Not recorded'
        : `Yes: ${yesValues.map(value => `${value}`).join(', ')}`,
    );
  }

  if (forms.some(f => f.wasIrsConducted === false)) {
    segments.push('No: N/A');
  }

  return segments;
};

export const collectDiscrepanciesForSite = (
  siteGroup: SessionsBySite,
  formsMap: Map<number, SurveillanceForm>,
): DiscrepancyField[] => {
  const sessions = siteGroup.sessions;
  const forms = sessions
    .map(session => formsMap.get(session.sessionId))
    .filter((form): form is SurveillanceForm => Boolean(form));

  const collectorNames = uniqueStringValues(sessions.map(s => s.collectorName));
  const collectorTitles = uniqueStringValues(sessions.map(s => s.collectorTitle));
  const collectionMethods = uniqueStringValues(sessions.map(s => s.collectionMethod));

  const numPeopleSleptInHouse = uniqueNonNull(forms.map(f => f.numPeopleSleptInHouse));
  const wasIrsConducted = uniqueNonNull(forms.map(f => f.wasIrsConducted));
  const monthsSinceIrsRaw = uniqueNonNull(forms.map(f => f.monthsSinceIrs));
  const numLlinsAvailable = uniqueNonNull(forms.map(f => f.numLlinsAvailable));
  const llinType = uniqueStringValues(forms.map(f => f.llinType));
  const llinBrand = uniqueStringValues(forms.map(f => f.llinBrand));
  const numPeopleSleptUnderLlin = uniqueNonNull(forms.map(f => f.numPeopleSleptUnderLlin));

  const fields: DiscrepancyField[] = [];
  const push = (
    key: DiscrepancyFieldKey,
    label: string,
    values: (string | number | boolean)[],
    shouldInclude: boolean,
    force = false,
  ) => {
    if (!shouldInclude) return;
    if (values.length <= 1 && !force) return;
    fields.push({
      key,
      label,
      details: values.length > 0 ? formatValueList(values) : 'Not recorded',
    });
  };

  push('collectorName', 'Collector Name', collectorNames, collectorNames.length > 1);
  push('collectorTitle', 'Collector Title', collectorTitles, collectorTitles.length > 1);
  push('collectionMethod', 'Collection Method', collectionMethods, collectionMethods.length > 1);
  push(
    'numPeopleSleptInHouse',
    'People In House',
    numPeopleSleptInHouse,
    numPeopleSleptInHouse.length > 1,
  );

  const hasIrsDiscrepancy = wasIrsConducted.length > 1;
  const hasYesAndNo =
    hasIrsDiscrepancy && wasIrsConducted.includes(true) && wasIrsConducted.includes(false);

  push('wasIrsConducted', 'IRS Conducted', wasIrsConducted, hasIrsDiscrepancy);
  const monthsSinceIrsValues = hasYesAndNo
    ? formatMonthsSinceIrsConflict(forms)
    : monthsSinceIrsRaw.map(value => `${value}`);
  push(
    'monthsSinceIrs',
    'Months Since IRS',
    monthsSinceIrsValues,
    hasIrsDiscrepancy || monthsSinceIrsRaw.length > 1,
    hasIrsDiscrepancy,
  );

  push(
    'numLlinsAvailable',
    'LLINs Available',
    numLlinsAvailable,
    numLlinsAvailable.length > 1,
  );
  push('llinType', 'LLIN Type', llinType, llinType.length > 1);
  push('llinBrand', 'LLIN Brand', llinBrand, llinBrand.length > 1);
  push(
    'numPeopleSleptUnderLlin',
    'People Slept Under LLIN',
    numPeopleSleptUnderLlin,
    numPeopleSleptUnderLlin.length > 1,
  );

  return fields;
};
