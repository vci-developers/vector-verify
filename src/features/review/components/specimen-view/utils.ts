export function formatHouseNumber(houseNumber: string): string {
  if (
    !houseNumber ||
    houseNumber.trim() === '' ||
    houseNumber.startsWith('Site')
  ) {
    return 'N/A';
  }
  return houseNumber;
}
