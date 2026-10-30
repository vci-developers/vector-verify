import { expect, test } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import {
    sexSchema,
    abdomenStatusSchema,
} from '@/api/specimen-image/validation/specimen-image-schema';
import { useSpecimenPredictionLabel } from '@/features/review/specimens-table/hooks/use-specimen-prediction-label';
import messages from '../../../../../messages/en.json';

function wrapper({ children }: { children: ReactNode }) {
    return (
        <NextIntlClientProvider
            locale="en"
            messages={{
                ReviewSpecimens: {
                    sexValues: {
                        Female: 'Translated female',
                        Male: 'Translated male',
                        Unknown: 'Translated unknown sex',
                    },
                    abdomenStatusValues: {
                        Unfed: 'Translated unfed',
                        'Fully Fed': 'Translated fed',
                        Gravid: 'Translated gravid',
                        Unknown: 'Translated unknown abdomen',
                    },
                },
            }}
        >
            {children}
        </NextIntlClientProvider>
    );
}

test('uses translation resources for sex and abdomen values, including Unknown', () => {
    const { result } = renderHook(useSpecimenPredictionLabel, { wrapper });
    expect(result.current('sex', 'Female')).toBe('Translated female');
    expect(result.current('sex', 'Male')).toBe('Translated male');
    expect(result.current('sex', 'Unknown')).toBe('Translated unknown sex');
    expect(result.current('abdomenStatus', 'Unfed')).toBe('Translated unfed');
    expect(result.current('abdomenStatus', 'Fully Fed')).toBe('Translated fed');
    expect(result.current('abdomenStatus', 'Gravid')).toBe('Translated gravid');
    expect(result.current('abdomenStatus', 'Unknown')).toBe(
        'Translated unknown abdomen',
    );
});

test('preserves species, unrecognized backend values, and empty placeholders', () => {
    const { result } = renderHook(useSpecimenPredictionLabel, { wrapper });
    expect(result.current('species', 'Anopheles gambiae')).toBe(
        'Anopheles gambiae',
    );
    expect(result.current('sex', 'New backend value')).toBe(
        'New backend value',
    );
    expect(result.current('abdomenStatus', 'Legacy value')).toBe(
        'Legacy value',
    );
    for (const value of ['', null, undefined]) {
        expect(result.current('sex', value)).toBe('—');
        expect(result.current('abdomenStatus', value)).toBe('—');
        expect(result.current('species', value)).toBe('—');
    }
});

test('provides an English label for every supported sex and abdomen value', () => {
    for (const value of sexSchema.options) {
        expect(messages.ReviewSpecimens.sexValues[value]).toBeTruthy();
    }
    for (const value of abdomenStatusSchema.options) {
        expect(
            messages.ReviewSpecimens.abdomenStatusValues[value],
        ).toBeTruthy();
    }
});
