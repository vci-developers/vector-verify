export function formatMonthName(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatDate(timestamp: number) {
  const date = new Date(timestamp);

  return {
    monthYear: date.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    }),
    shortMonthYear: date.toLocaleString('default', {
      month: 'short',
      year: 'numeric',
    }),
    fullDate: date.toLocaleDateString(),
    fullDateTime: date.toLocaleString(),
    month: date.toLocaleString('default', { month: 'long' }),
    shortMonth: date.toLocaleString('default', { month: 'short' }),
    numericMonth: date.getMonth() + 1,
    year: date.getFullYear(),
    day: date.getDate(),
    weekday: date.toLocaleString('default', { weekday: 'long' }),
    shortWeekday: date.toLocaleString('default', { weekday: 'short' }),
    time: date.toLocaleTimeString(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
    dateObject: date,
  };
}
