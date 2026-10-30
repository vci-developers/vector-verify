import type { SpecimenClassificationAxis } from '@/api/specimen/validation/specimen-schema';
import { useTranslations } from 'next-intl';

export function useSpecimenPredictionLabel() {
    const t = useTranslations('ReviewSpecimens');

    return function getPredictionLabel(
        field: SpecimenClassificationAxis,
        value: string | null | undefined,
    ) {
        if (!value) return '—';
        if (field === 'species') return value;

        const key = `${field}Values.${value}`;
        return t.has(key) ? t(key) : value;
    };
}
