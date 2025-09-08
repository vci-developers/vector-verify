export function toDomId(label: string, prefix?: string): string {
  const base = label
    .trim()
    .normalize('NFKD')
    .replace(/[_/]+/g, ' ')
    .replace(/([\p{Ll}\p{Nd}])([\p{Lu}])/gu, '$1-$2')
    .replace(/(\p{Lu}+)(\p{Lu}\p{Ll})/gu, '$1-$2')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return prefix ? `${prefix}-${base}` : base;
}

