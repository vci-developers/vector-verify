import type { MonthlySpecimenCounts } from '@/api/specimen/validation/get-monthly-specimens-count-schema';
import type { SpecimenClassificationAxis } from '@/api/specimen/validation/specimen-schema';
import type { ChartConfig } from '@/components/ui/chart';
import { format, parseISO } from 'date-fns';

type ChartColorFamily = 'red' | 'yellow' | 'green';

const CHART_COLOR_BY_FAMILY: Record<
    ChartColorFamily,
    { hue: number; saturation: number; lightnessRange: [number, number] }
> = {
    red: { hue: 0, saturation: 70, lightnessRange: [40, 60] },
    yellow: { hue: 45, saturation: 80, lightnessRange: [40, 55] },
    green: { hue: 140, saturation: 60, lightnessRange: [35, 55] },
};

const ALL_CHART_COLOR_FAMILIES = Object.keys(
    CHART_COLOR_BY_FAMILY,
) as ChartColorFamily[];

const CHART_COLOR_FAMILY_BY_CLASSIFICATION_AXIS: Record<
    SpecimenClassificationAxis,
    (specimenClass: string) => ChartColorFamily
> = {
    species: specimenClass => {
        const lowercaseSpecimenClass = specimenClass.toLowerCase();
        if (lowercaseSpecimenClass.includes('anopheles')) return 'red';
        if (lowercaseSpecimenClass.includes('non-mosquito')) return 'green';
        return 'yellow';
    },
    sex: specimenClass => {
        const lowercaseSpecimenClass = specimenClass.toLowerCase();
        if (lowercaseSpecimenClass.includes('female')) return 'red';
        if (lowercaseSpecimenClass.includes('male')) return 'yellow';
        return 'green';
    },
    abdomenStatus: specimenClass => {
        const lowercaseSpecimenClass = specimenClass.toLowerCase();
        if (lowercaseSpecimenClass.includes('unfed')) return 'green';
        return 'red';
    },
};

export function sumSpecimenCountsByClass(
    specimenClassificationAxis: SpecimenClassificationAxis,
    monthlySpecimenCounts: MonthlySpecimenCounts,
): { specimenClass: string; specimenCount: number }[] {
    const specimenCountsByClass: Record<string, number> = {};
    for (const monthlySpecimenCount of monthlySpecimenCounts) {
        for (const [specimenClass, specimenCount] of Object.entries(
            monthlySpecimenCount[specimenClassificationAxis],
        )) {
            specimenCountsByClass[specimenClass] =
                (specimenCountsByClass[specimenClass] ?? 0) + specimenCount;
        }
    }
    return Object.entries(specimenCountsByClass).map(
        ([specimenClass, specimenCount]) => ({
            specimenClass,
            specimenCount,
        }),
    );
}

export function groupSpecimenCountsByMonth(
    specimenClassificationAxis: SpecimenClassificationAxis,
    monthlySpecimenCounts: MonthlySpecimenCounts,
): Record<string, string | number>[] {
    const allSpecimenClasses = [
        ...new Set(
            monthlySpecimenCounts.flatMap(monthlySpecimenCount =>
                Object.keys(monthlySpecimenCount[specimenClassificationAxis]),
            ),
        ),
    ];
    return monthlySpecimenCounts.map(monthlySpecimenCount => ({
        month: format(parseISO(monthlySpecimenCount.from), 'MMM yyyy'),
        ...Object.fromEntries(
            allSpecimenClasses.map(specimenClass => [specimenClass, 0]),
        ),
        ...monthlySpecimenCount[specimenClassificationAxis],
    }));
}

export function buildSpecimenChartConfig(
    specimenClassificationAxis: SpecimenClassificationAxis,
    specimenClasses: string[],
): ChartConfig {
    return Object.fromEntries(
        ALL_CHART_COLOR_FAMILIES.flatMap(colorFamily => {
            const specimenClassesInColorFamily = specimenClasses.filter(
                specimenClass =>
                    CHART_COLOR_FAMILY_BY_CLASSIFICATION_AXIS[
                        specimenClassificationAxis
                    ](specimenClass) === colorFamily,
            );
            if (specimenClassesInColorFamily.length === 0) return [];

            const { hue, saturation, lightnessRange } =
                CHART_COLOR_BY_FAMILY[colorFamily];

            return specimenClassesInColorFamily.map(
                (
                    specimenClass,
                    indexInColorFamily,
                ): [string, ChartConfig[string]] => {
                    const lightness =
                        specimenClassesInColorFamily.length === 1
                            ? (lightnessRange[0] + lightnessRange[1]) / 2
                            : lightnessRange[0] +
                              (indexInColorFamily /
                                  (specimenClassesInColorFamily.length - 1)) *
                                  (lightnessRange[1] - lightnessRange[0]);
                    return [
                        specimenClass,
                        {
                            label: specimenClass,
                            color: `hsl(${hue}, ${saturation}%, ${lightness.toFixed(0)}%)`,
                        },
                    ];
                },
            );
        }),
    );
}
