export function toDomId(label: string, prefix?: string): string {
  const base = label
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return prefix ? `${prefix}-${base}` : base;
}
