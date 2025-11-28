import type { SpecimenCountsSite } from '@/features/review/types';

type ColumnDisplay = { originalName: string; displayName: string };

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

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12
  ) {
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

const SEX_SORT_ORDER = [
  'Male',
  'Female Unfed',
  'Female Fully-fed',
  'Female Gravid',
];

function extractColumnMeta(columnName: string) {
  const parts = columnName.trim().split(/\s+/);
  if (parts.length < 1) return null;

  const normalizedColumnName = columnName
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const normalizedTokens = normalizedColumnName.split(' ');
  const isNonMosquito =
    normalizedTokens.length >= 2 &&
    normalizedTokens[0] === 'non' &&
    normalizedTokens[1] === 'mosquito';

  if (isNonMosquito) {
    return {
      species: 'NON-MOSQUITO',
      column: {
        originalName: columnName,
        displayName: 'NON-MOSQUITO',
      } as ColumnDisplay,
    };
  }

  if (normalizedColumnName.includes('unknown unknown unknown')) {
    return null;
  }

  const lowerParts = parts.map(part => part.toLowerCase());
  const sexIndex = lowerParts.findIndex(
    part => part === 'male' || part === 'female',
  );

  if (sexIndex !== -1) {
    const species = parts.slice(0, sexIndex).join(' ');
    const remainder = lowerParts.slice(sexIndex).join(' ');

    let displayName: string;
    if (!remainder.includes('female')) {
      if (!remainder.includes('male')) return null;
      displayName = 'Male';
    } else if (remainder.includes('unfed')) {
      displayName = 'Female Unfed';
    } else if (
      remainder.includes('fully-fed') ||
      remainder.includes('fully fed')
    ) {
      displayName = 'Female Fully-fed';
    } else if (remainder.includes('gravid')) {
      displayName = 'Female Gravid';
    } else {
      displayName = 'Female';
    }

    return {
      species,
      column: { originalName: columnName, displayName } as ColumnDisplay,
    };
  }

  return {
    species: columnName,
    column: {
      originalName: columnName,
      displayName: columnName,
    } as ColumnDisplay,
  };
}

export function groupColumnsBySpecies(columns: string[]) {
  const columnsBySpecies: Record<string, ColumnDisplay[]> = {};
  const speciesOrder: string[] = [];

  columns.forEach(columnName => {
    const meta = extractColumnMeta(columnName);
    if (!meta) return;

    if (!columnsBySpecies[meta.species]) {
      columnsBySpecies[meta.species] = [];
      speciesOrder.push(meta.species);
    }

    columnsBySpecies[meta.species].push(meta.column);
  });

  speciesOrder.forEach(species => {
    columnsBySpecies[species].sort((a, b) => {
      const aIndex = SEX_SORT_ORDER.indexOf(a.displayName);
      const bIndex = SEX_SORT_ORDER.indexOf(b.displayName);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
  });

  const totalColumns = speciesOrder.reduce(
    (sum, species) => sum + columnsBySpecies[species].length,
    0,
  );

  return { speciesOrder, columnsBySpecies, totalColumns };
}

export function formatSiteLabel(site: {
  siteId: number;
  district: string | null;
  subCounty: string | null;
  parish: string | null;
  villageName: string | null;
  houseNumber: string | null;
  healthCenter: string | null;
}): { topLine: string; bottomLine: string | null } {
  const primaryParts = [
    site.villageName,
    site.houseNumber && `House ${site.houseNumber}`,
  ].filter(Boolean) as string[];

  const fallback =
    site.healthCenter ??
    site.parish ??
    site.subCounty ??
    site.district ??
    `Site #${site.siteId}`;

  const topLine = primaryParts.length > 0 ? primaryParts.join(' • ') : fallback;

  const secondaryParts = [
    site.healthCenter && site.healthCenter !== topLine
      ? site.healthCenter
      : null,
    site.parish && !primaryParts.includes(site.parish) ? site.parish : null,
    site.subCounty && !primaryParts.includes(site.subCounty)
      ? site.subCounty
      : null,
    site.district && !primaryParts.includes(site.district)
      ? site.district
      : null,
  ].filter(Boolean) as string[];

  return {
    topLine,
    bottomLine: secondaryParts.length > 0 ? secondaryParts.join(' • ') : null,
  };
}

export function getSiteLabel(site: SpecimenCountsSite) {
  const info = site.siteInfo;

  if (!info) {
    return {
      topLine: `Site #${site.siteId}`,
      bottomLine: null,
    };
  }

  const primaryParts = [
    info.villageName,
    info.houseNumber && `House ${info.houseNumber}`,
  ].filter(Boolean) as string[];

  const fallback =
    info.healthCenter ??
    info.parish ??
    info.subCounty ??
    info.district ??
    `Site #${site.siteId}`;

  const topLine = primaryParts.length > 0 ? primaryParts.join(' • ') : fallback;

  const secondaryParts = [
    info.healthCenter && info.healthCenter !== topLine
      ? info.healthCenter
      : null,
    info.parish && !primaryParts.includes(info.parish) ? info.parish : null,
    info.subCounty && !primaryParts.includes(info.subCounty)
      ? info.subCounty
      : null,
    info.district && !primaryParts.includes(info.district)
      ? info.district
      : null,
  ].filter(Boolean) as string[];

  return {
    topLine,
    bottomLine: secondaryParts.length > 0 ? secondaryParts.join(' • ') : null,
  };
}
