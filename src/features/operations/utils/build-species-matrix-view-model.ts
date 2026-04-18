import type { AnnotationConfusionMatrix } from '@/api/annotation/validation/get-annotations-summary-schema';

interface MatrixCell {
    count: number;
    ratio: number | null;
    isDiagonal: boolean;
}

interface MatrixRow {
    label: string;
    cells: MatrixCell[];
}

interface ClassPerformance {
    label: string;
    precision: number | null;
    recall: number | null;
}

interface TopConfusion {
    actual: string;
    predicted: string;
    count: number;
    rowShare: number | null;
}

export interface SpeciesMatrixViewModel {
    columns: string[];
    rows: MatrixRow[];
    classPerformance: ClassPerformance[];
    topConfusion: TopConfusion | null;
    totalCount: number;
    correctCount: number;
    accuracy: number | null;
}

export function buildSpeciesMatrixViewModel(
    matrix?: AnnotationConfusionMatrix,
): SpeciesMatrixViewModel | null {
    if (!matrix) return null;

    const labels = [...matrix.columns];
    const rowsByLabel = new Map(matrix.data.map(row => [row.rowLabel, row]));

    for (const row of matrix.data) {
        if (!labels.includes(row.rowLabel)) {
            labels.push(row.rowLabel);
        }
    }

    if (labels.length === 0) {
        return null;
    }

    const counts = labels.map(rowLabel =>
        labels.map(columnLabel => {
            const row = rowsByLabel.get(rowLabel);
            if (!row) return 0;
            const value = row.values[columnLabel];
            return typeof value === 'number' && value >= 0 ? value : 0;
        }),
    );

    const rowTotals = counts.map(row =>
        row.reduce((sum, value) => sum + value, 0),
    );
    const columnTotals = labels.map((_, columnIndex) =>
        counts.reduce((sum, row) => sum + (row[columnIndex] ?? 0), 0),
    );
    const totalCount = rowTotals.reduce((sum, total) => sum + total, 0);

    let topConfusion: TopConfusion | null = null;

    const rows = labels.map((rowLabel, rowIndex) => ({
        label: rowLabel,
        cells: labels.map((columnLabel, columnIndex) => {
            const count = counts[rowIndex]?.[columnIndex] ?? 0;
            const rowTotal = rowTotals[rowIndex] ?? 0;
            const ratio = rowTotal > 0 ? count / rowTotal : null;
            const isDiagonal = rowLabel === columnLabel;

            if (!isDiagonal && count > 0) {
                const nextTopConfusion: TopConfusion = {
                    actual: rowLabel,
                    predicted: columnLabel,
                    count,
                    rowShare: ratio,
                };

                if (
                    topConfusion === null ||
                    nextTopConfusion.count > topConfusion.count
                ) {
                    topConfusion = nextTopConfusion;
                }
            }

            return {
                count,
                ratio,
                isDiagonal,
            };
        }),
    }));

    const classPerformance = labels.map((label, index) => {
        const truePositive = counts[index]?.[index] ?? 0;
        const predictedTotal = columnTotals[index] ?? 0;
        const actualTotal = rowTotals[index] ?? 0;

        return {
            label,
            precision:
                predictedTotal > 0 ? truePositive / predictedTotal : null,
            recall: actualTotal > 0 ? truePositive / actualTotal : null,
        };
    });

    const correctCount = labels.reduce(
        (sum, _, index) => sum + (counts[index]?.[index] ?? 0),
        0,
    );

    return {
        columns: labels,
        rows,
        classPerformance,
        topConfusion,
        totalCount,
        correctCount,
        accuracy: totalCount > 0 ? correctCount / totalCount : null,
    };
}
