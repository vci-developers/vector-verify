export function buildReviewPath(district: string, monthYear: string): string {
  const encodedDistrict = encodeURIComponent(district);
  const encodedMonthYear = encodeURIComponent(monthYear);
  return `/review/${encodedDistrict}/${encodedMonthYear}`;
}

export function buildMasterTableViewPath(
  district: string,
  monthYear: string,
): string {
  return `${buildReviewPath(district, monthYear)}/master-table-view`;
}
