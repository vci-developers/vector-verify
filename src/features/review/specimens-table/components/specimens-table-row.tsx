'use client';

import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import type { Session } from '@/api/session/validation/session-schema';
import type { Site } from '@/api/site/validation/site-schema';
import { useGetAllReviewLogs } from '@/api/session/hooks/use-get-all-review-logs';
import { TableCell, TableRow } from '@/components/ui/table';
import SpecimenImagePreview from './specimen-image-preview';
import SpecimenReviewLink from './specimen-review-link';
import SpecimenChangelogDrawer from './specimen-changelog-drawer';
import { buildSpecimenChangelog } from '../utils/build-specimen-changelog';
import { getSiteDisplayName } from '@/features/review/sessions-table/utils/get-site-display-name';
import { useTranslations } from 'next-intl';

interface SpecimensTableRowProps {
    specimen: Specimen;
    session?: Session;
    site?: Site;
    cycleLabel?: string;
    programId: number;
    hasCollectionCycles: boolean;
    timezone?: string;
}
export default function SpecimensTableRow({
    specimen,
    session,
    site,
    cycleLabel,
    programId,
    hasCollectionCycles,
    timezone,
}: SpecimensTableRowProps) {
    const t = useTranslations('ReviewSpecimens');
    const { data: logs, isError } = useGetAllReviewLogs({
        specimenId: specimen.id,
        action: 'update_specimen_image_prediction',
        hasChanges: 'true',
    });
    const imageCount = specimen.images?.length ?? 0;
    const prediction = specimen.thumbnailImage;
    return (
        <TableRow>
            <TableCell>{cycleLabel ?? '-'}</TableCell>
            <TableCell>
                <span className="inline-flex items-center gap-1">
                    {specimen.specimenId}
                    {imageCount > 0 && (
                        <SpecimenImagePreview specimen={specimen} />
                    )}
                </span>
            </TableCell>
            <TableCell>{specimen.sessionId}</TableCell>
            <TableCell>
                {site ? getSiteDisplayName(site) : (session?.siteId ?? '-')}
            </TableCell>
            <TableCell>{prediction?.species ?? '-'}</TableCell>
            <TableCell>{prediction?.sex ?? '-'}</TableCell>
            <TableCell>{prediction?.abdomenStatus ?? '-'}</TableCell>
            <TableCell>{imageCount}</TableCell>
            <TableCell>
                {!session ? (
                    t('accessError')
                ) : isError || (logs && !logs.ok) ? (
                    <span role="alert">{t('logsError')}</span>
                ) : !logs ? (
                    t('loading')
                ) : (
                    <SpecimenChangelogDrawer
                        changelog={buildSpecimenChangelog(
                            specimen,
                            session.siteId,
                            timezone ?? 'UTC',
                            logs.data.logs,
                        )}
                    />
                )}
            </TableCell>
            <TableCell>
                {session ? (
                    <SpecimenReviewLink
                        session={session}
                        programId={programId}
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
