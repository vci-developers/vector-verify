'use client';

import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import type { ReportingSegment } from '@/features/operations/field-user-compliance/utils/reporting-segment-helpers';

interface ReportingSegmentLabelProps {
    segment: ReportingSegment;
}

export default function ReportingSegmentLabel({
    segment,
}: ReportingSegmentLabelProps) {
    const tCollectionCycle = useTranslations('CollectionCycle');
    return segment.kind === 'cycle'
        ? tCollectionCycle('badgeLabel', { cycleNumber: segment.cycleNumber })
        : format(parseISO(segment.startDate), 'MMM yy');
}
