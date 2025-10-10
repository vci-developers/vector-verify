export interface MonthDateRange {
  startDate: string;
  endDate: string;
}

export function getMonthDateRange(
  monthYear?: string | null,
): MonthDateRange | null {
  if (!monthYear) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})$/.exec(monthYear.trim());
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));

  const format = (date: Date) => date.toISOString().slice(0, 10);

  return {
    startDate: format(start),
    endDate: format(end),
  };
}
