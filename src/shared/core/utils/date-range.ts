export type DateRangeOption =
  | '1-month'
  | '3-months'
  | '6-months'
  | '1-year'
  | 'all-time';

export interface DateRange {
  createdAfter?: string;
  createdBefore: string;
}

export const DATE_RANGE_OPTIONS = [
  { value: '1-month' as const, label: 'Last 1 Month' },
  { value: '3-months' as const, label: 'Last 3 Months' },
  { value: '6-months' as const, label: 'Last 6 Months' },
  { value: '1-year' as const, label: 'Last 1 Year' },
  { value: 'all-time' as const, label: 'All Time' },
] as const;

function getEndOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));
}

export function calculateDateRange(option: DateRangeOption): DateRange {
  const now = new Date();
  const endOfMonth = getEndOfCurrentMonth();
  const createdBefore = endOfMonth.toISOString();

  if (option === 'all-time') {
    return { createdBefore };
  }

  const createdAfter = new Date(now);

  switch (option) {
    case '1-month':
      createdAfter.setMonth(createdAfter.getMonth() - 1);
      break;
    case '3-months':
      createdAfter.setMonth(createdAfter.getMonth() - 3);
      break;
    case '6-months':
      createdAfter.setMonth(createdAfter.getMonth() - 6);
      break;
    case '1-year':
      createdAfter.setFullYear(createdAfter.getFullYear() - 1);
      break;
  }

  return {
    createdAfter: createdAfter.toISOString(),
    createdBefore,
  };
}

export function toDateOnly(isoString?: string): string | undefined {
  if (!isoString) return undefined;
  return isoString.slice(0, 10);
}
