import type {
  SpeciesDistribution,
  SexRatio,
  AbdomenStatus,
} from '@/features/review/types/dashboard';

/**
 * Data processing utilities for dashboard components
 * Single responsibility: Transform raw data into chart-ready formats
 */

export interface PieChartData {
  name: string;
  value: number;
  percentage: number;
}

export interface RadialChartData {
  name: string;
  value: number;
  percentage: number;
  fill: string;
}

export interface LegendItem {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Process sex ratio data for radial chart display
 */
export function processSexRatioData(sexRatio: SexRatio): {
  data: RadialChartData[];
  colors: string[];
  legendItems: LegendItem[];
} {
  const colors = ['#22c55e', '#86efac'];
  const data = [
    {
      name: 'Male',
      value: sexRatio.male.count,
      percentage: sexRatio.male.percentage,
      fill: colors[0],
    },
    {
      name: 'Female',
      value: sexRatio.female.count,
      percentage: sexRatio.female.percentage,
      fill: colors[1],
    },
  ];

  const legendItems = [
    {
      label: 'Male',
      count: sexRatio.male.count,
      percentage: sexRatio.male.percentage,
      color: colors[0],
    },
    {
      label: 'Female',
      count: sexRatio.female.count,
      percentage: sexRatio.female.percentage,
      color: colors[1],
    },
  ];

  return { data, colors, legendItems };
}

/**
 * Process abdomen status data for radial chart display
 */
export function processAbdomenStatusData(abdomenStatus: AbdomenStatus): {
  data: RadialChartData[];
  colors: string[];
  legendItems: LegendItem[];
} {
  const colors = ['#22c55e', '#16a34a', '#84cc16'];
  const data = [
    {
      name: 'Fed',
      value: abdomenStatus.fed.count,
      percentage: abdomenStatus.fed.percentage,
      fill: colors[0],
    },
    {
      name: 'Unfed',
      value: abdomenStatus.unfed.count,
      percentage: abdomenStatus.unfed.percentage,
      fill: colors[1],
    },
    {
      name: 'Gravid',
      value: abdomenStatus.gravid.count,
      percentage: abdomenStatus.gravid.percentage,
      fill: colors[2],
    },
  ];

  const legendItems = [
    {
      label: 'Fed',
      count: abdomenStatus.fed.count,
      percentage: abdomenStatus.fed.percentage,
      color: colors[0],
    },
    {
      label: 'Unfed',
      count: abdomenStatus.unfed.count,
      percentage: abdomenStatus.unfed.percentage,
      color: colors[1],
    },
    {
      label: 'Gravid',
      count: abdomenStatus.gravid.count,
      percentage: abdomenStatus.gravid.percentage,
      color: colors[2],
    },
  ];

  return { data, colors, legendItems };
}

/**
 * Check if there's data available for rendering charts
 */
export function hasChartData(
  sexRatio: SexRatio,
  abdomenStatus: AbdomenStatus,
  speciesDistribution: SpeciesDistribution[],
): boolean {
  return (
    sexRatio.total > 0 ||
    abdomenStatus.total > 0 ||
    speciesDistribution.length > 0
  );
}
