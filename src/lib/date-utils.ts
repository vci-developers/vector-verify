/**
 * Format a timestamp as a month and year
 */
export function formatMonthYear(timestamp: number) {
  return new Date(timestamp).toLocaleString("default", {
    year: "numeric",
    month: "long",
  });
}
