import type { CSSProperties } from 'react';

export const integerCountFormatter = new Intl.NumberFormat('en-US');

const MATRIX_CELL_STYLE = {
    diagonal: {
        baseAlpha: 0.14,
        alphaRange: 0.78,
        highContrastTextThreshold: 0.52,
    },
    offDiagonal: {
        baseAlpha: 0.06,
        alphaRange: 0.5,
        emphasizedTextThreshold: 0.2,
    },
} as const;

export function formatMatrixPercentage(value: number | null) {
    if (value === null) {
        return '—';
    }

    return `${(value * 100).toFixed(1)}%`;
}

function getHeatmapBackgroundColor(
    colorVariable: '--success' | '--destructive',
    opacity: number,
) {
    return `color-mix(in srgb, var(${colorVariable}) ${opacity * 100}%, transparent)`;
}

export function getMatrixCellPresentation(
    rowShare: number | null,
    isCorrectPrediction: boolean,
): { className: string; style?: CSSProperties } {
    if (rowShare === null) {
        return {
            className: 'bg-muted text-muted-foreground',
        };
    }

    if (isCorrectPrediction) {
        const opacity =
            MATRIX_CELL_STYLE.diagonal.baseAlpha +
            rowShare * MATRIX_CELL_STYLE.diagonal.alphaRange;

        return {
            className:
                rowShare >= MATRIX_CELL_STYLE.diagonal.highContrastTextThreshold
                    ? 'text-success-foreground'
                    : 'text-success',
            style: {
                backgroundColor: getHeatmapBackgroundColor(
                    '--success',
                    opacity,
                ),
            },
        };
    }

    const opacity =
        MATRIX_CELL_STYLE.offDiagonal.baseAlpha +
        rowShare * MATRIX_CELL_STYLE.offDiagonal.alphaRange;

    return {
        className:
            rowShare >= MATRIX_CELL_STYLE.offDiagonal.emphasizedTextThreshold
                ? 'text-destructive'
                : 'text-destructive/80',
        style: {
            backgroundColor: getHeatmapBackgroundColor(
                '--destructive',
                opacity,
            ),
        },
    };
}
