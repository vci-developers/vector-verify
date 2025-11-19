export function buildReviewPath(district: string, monthYear: string): string {
  const encodedDistrict = encodeURIComponent(district);
  const encodedMonthYear = encodeURIComponent(monthYear);
  return `/review/${encodedDistrict}/${encodedMonthYear}`;
}

export function buildDashboardPath(district: string, monthYear: string): string {
  return `${buildReviewPath(district, monthYear)}/dashboard`;
}

