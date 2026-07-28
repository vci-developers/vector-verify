import type {
    Session,
    SessionState,
} from '@/api/session/validation/session-schema';
import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import type { Site } from '@/api/site/validation/site-schema';
import { getSiteDisplayName } from '@/features/review/sessions-table/utils/get-site-display-name';
import { formatCollectionCycleLabel } from '@/features/review/utils/format-collection-cycle-label';
import { REVIEW_STATE_LABEL_KEY } from '@/features/review/utils/review-site-session-summary';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const SESSION_STATE_LABEL_KEY: Record<SessionState, string> = {
    ...REVIEW_STATE_LABEL_KEY,
    NOT_APPLICABLE: 'notApplicable',
};

interface SessionsTableRowProps {
    session: Session;
    site: Site | undefined;
    cycle: CollectionCycle | undefined;
    collectionCycles: CollectionCycle[];
    isReassigning: boolean;
    onReassign: (session: Session, newCollectionCycleId: number) => void;
}

export default function SessionsTableRow({
    session,
    site,
    cycle,
    collectionCycles,
    isReassigning,
    onReassign,
}: SessionsTableRowProps) {
    const t = useTranslations('ReviewSessionsTable');
    const tSitesList = useTranslations('ReviewSitesList');

    const timezone = cycle?.timezone ?? null;
    const reviewUnitHref =
        session.collectionCycleId !== null
            ? `/review/${session.siteId}?collectionCycleId=${session.collectionCycleId}`
            : `/review/${session.siteId}`;

    return (
        <TableRow>
            <TableCell>
                {cycle
                    ? t('cycleNumber', { cycleNumber: cycle.cycleNumber })
                    : t('unassigned')}
            </TableCell>
            <TableCell>
                <Link
                    href={reviewUnitHref}
                    className="text-primary hover:underline"
                >
                    {session.sessionId}
                </Link>
            </TableCell>
            <TableCell>
                {getSiteDisplayName(site) ?? t('unknownSite')}
            </TableCell>
            <TableCell>
                {formatDateInTimezone(
                    session.collectionDate,
                    timezone,
                    'MMM d, yyyy',
                )}
            </TableCell>
            <TableCell>
                {formatDateInTimezone(
                    session.createdAt,
                    timezone,
                    'MMM d, yyyy h:mm a',
                )}
            </TableCell>
            <TableCell>
                {session.state && (
                    <Badge variant="outline">
                        {tSitesList(SESSION_STATE_LABEL_KEY[session.state])}
                    </Badge>
                )}
            </TableCell>
            <TableCell>
                <Select
                    value={
                        session.collectionCycleId !== null
                            ? String(session.collectionCycleId)
                            : undefined
                    }
                    onValueChange={value => onReassign(session, Number(value))}
                    disabled={isReassigning}
                >
                    <SelectTrigger className="w-52">
                        <SelectValue placeholder={t('unassigned')} />
                    </SelectTrigger>
                    <SelectContent>
                        {collectionCycles.map(reassignmentCycle => (
                            <SelectItem
                                key={reassignmentCycle.id}
                                value={String(reassignmentCycle.id)}
                            >
                                {formatCollectionCycleLabel(reassignmentCycle)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </TableCell>
        </TableRow>
    );
}
