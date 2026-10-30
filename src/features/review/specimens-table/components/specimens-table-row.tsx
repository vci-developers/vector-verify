'use client';

import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import type { Session } from '@/api/session/validation/session-schema';
import type { Site } from '@/api/site/validation/site-schema';
import type { ReviewLog } from '@/api/session/validation/get-review-logs-schema';
import { TableCell, TableRow } from '@/components/ui/table';
import SpecimenImagePreview from './specimen-image-preview';
import SpecimenReviewLink from './specimen-review-link';
import SpecimenChangelogDrawer from './specimen-changelog-drawer';
import { buildSpecimenChangelog } from '../utils/build-specimen-changelog';
import { getSiteDisplayName } from '@/features/review/sessions-table/utils/get-site-display-name';
import { useTranslations } from 'next-intl';
import { useSpecimenPredictionLabel } from '../hooks/use-specimen-prediction-label';

interface SpecimensTableRowProps {
    specimen: Specimen;
    reviewLogs?: ReviewLog[];
    reviewLogsError: boolean;
    session?: Session;
    site?: Site;
    cycleLabel?: string;
    hasCollectionCycles: boolean;
    timezone?: string;
}
export default function SpecimensTableRow({
    specimen,
    reviewLogs,
    reviewLogsError,
    session,
    site,
    cycleLabel,
    hasCollectionCycles,
    timezone,
}: SpecimensTableRowProps) {
    const t = useTranslations('ReviewSpecimens');
    const getPredictionLabel = useSpecimenPredictionLabel();
    const imageCount = specimen.images?.length ?? 0;
    const prediction = specimen.thumbnailImage;
    const siteDisplayName = site
        ? getSiteDisplayName(site) || '—'
        : String(session?.siteId ?? '—');
    return (
        <TableRow>
            <TableCell>{cycleLabel || '—'}</TableCell>
            <TableCell>
                <span className="inline-flex items-center gap-1">
                    {specimen.specimenId}
                    {imageCount > 0 && (
                        <SpecimenImagePreview specimen={specimen} />
                    )}
                </span>
            </TableCell>
            <TableCell>{specimen.sessionId}</TableCell>
            <TableCell>{siteDisplayName}</TableCell>
            <TableCell>{prediction?.species || '—'}</TableCell>
            <TableCell>{getPredictionLabel('sex', prediction?.sex)}</TableCell>
            <TableCell>
                {getPredictionLabel('abdomenStatus', prediction?.abdomenStatus)}
            </TableCell>
            <TableCell>{imageCount}</TableCell>
            <TableCell>
                {!session ? (
                    t('accessError')
                ) : reviewLogsError ? (
                    <span role="alert">{t('logsError')}</span>
                ) : !reviewLogs ? (
                    t('loading')
                ) : (
                    <SpecimenChangelogDrawer
                        siteDisplayName={siteDisplayName}
                        changelog={buildSpecimenChangelog(
                            specimen,
                            session.siteId,
                            timezone ?? 'UTC',
                            reviewLogs,
                        )}
                    />
                )}
            </TableCell>
            <TableCell>
                {session ? (
                    <SpecimenReviewLink
                        session={session}
                        specimenId={specimen.id}
                        hasCollectionCycles={hasCollectionCycles}
                        timezone={timezone}
                    />
                ) : (
                    t('accessError')
                )}
            </TableCell>
        </TableRow>
    );
}
