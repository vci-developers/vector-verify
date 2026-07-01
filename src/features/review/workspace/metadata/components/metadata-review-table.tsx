'use client';

import type { Session } from '@/api/session/validation/session-schema';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/utils/cn';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';
import {
    formatDisplayValue,
    NOT_APPLICABLE,
    type MetadataSection,
} from '../utils/metadata-section';
import ConflictResolutionControl from './conflict-resolution-control';

interface MetadataReviewTableProps {
    sessions: Session[];
    timezone: string | null;
    sections: MetadataSection[];
    resolutionsByMetadataRowId: Map<string, string>;
    onConflictResolutionChange: (
        metadataRowId: string,
        chosenDisplayValue: string,
    ) => void;
    disabledRowIds: Set<string>;
    readOnly: boolean;
}

export default function MetadataReviewTable({
    sessions,
    timezone,
    sections,
    resolutionsByMetadataRowId,
    onConflictResolutionChange,
    disabledRowIds,
    readOnly,
}: MetadataReviewTableProps) {
    const t = useTranslations('ReviewMetadata');

    const showResolutionColumn =
        !readOnly &&
        sections.some(section => section.rows.some(row => row.hasConflict));

    const showSectionHeaders = sections.length > 1;
    const sectionHeaderColSpan =
        1 + sessions.length + (showResolutionColumn ? 1 : 0);

    return (
        <div className="overflow-x-auto">
            <Table className="border-border rounded-md border">
                <TableHeader>
                    <TableRow className="h-14">
                        <TableHead className="border-border w-48 border" />
                        {sessions.map(session => (
                            <TableHead
                                key={session.sessionId}
                                className="border-border border"
                            >
                                {formatDateInTimezone(
                                    session.collectionDate,
                                    timezone,
                                    'MMM d, yyyy',
                                )}
                            </TableHead>
                        ))}
                        {showResolutionColumn && (
                            <TableHead className="border-border bg-background sticky right-0 z-20 border font-semibold">
                                {t('resolution')}
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sections.map(section => (
                        <Fragment key={section.key}>
                            {showSectionHeaders && (
                                <TableRow className="bg-muted/50 h-12">
                                    <TableCell
                                        colSpan={sectionHeaderColSpan}
                                        className="border-border border font-semibold"
                                    >
                                        {section.title ??
                                            t('sessionSectionTitle')}
                                    </TableCell>
                                </TableRow>
                            )}
                            {section.rows.map(row => {
                                const isRowDisabled = disabledRowIds.has(
                                    row.id,
                                );
                                const isResolved =
                                    resolutionsByMetadataRowId.has(row.id) ||
                                    isRowDisabled;
                                const chosenResolution = isRowDisabled
                                    ? NOT_APPLICABLE
                                    : resolutionsByMetadataRowId.get(row.id);
                                const resolutionOptions = [
                                    ...new Set(
                                        [
                                            ...row.fieldValueBySessionId.values(),
                                        ].map(formatDisplayValue),
                                    ),
                                ];
                                const isUnitRow = section.title !== null;

                                return (
                                    <TableRow
                                        key={row.id}
                                        className={cn(
                                            'h-14',
                                            row.hasConflict &&
                                                !isResolved &&
                                                !readOnly &&
                                                'bg-destructive/10 hover:bg-destructive/15',
                                        )}
                                    >
                                        <TableCell
                                            className={cn(
                                                'border-border w-48 border font-medium',
                                                isUnitRow && 'pl-8',
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                {row.hasConflict &&
                                                    !readOnly &&
                                                    (isResolved ? (
                                                        <CircleCheck className="h-4 w-4 shrink-0 text-green-600" />
                                                    ) : (
                                                        <TriangleAlert className="text-destructive h-4 w-4 shrink-0" />
                                                    ))}
                                                {row.label}
                                            </div>
                                        </TableCell>
                                        {sessions.map(session => {
                                            if (
                                                !row.fieldValueBySessionId.has(
                                                    session.sessionId,
                                                )
                                            ) {
                                                return (
                                                    <TableCell
                                                        key={session.sessionId}
                                                        className="border-border border"
                                                    />
                                                );
                                            }
                                            const originalDisplayValue =
                                                formatDisplayValue(
                                                    row.fieldValueBySessionId.get(
                                                        session.sessionId,
                                                    ),
                                                );
                                            const effectiveDisplayValue =
                                                isRowDisabled
                                                    ? NOT_APPLICABLE
                                                    : (chosenResolution ??
                                                      originalDisplayValue);
                                            return (
                                                <TableCell
                                                    key={session.sessionId}
                                                    className={cn(
                                                        'border-border border',
                                                        effectiveDisplayValue !==
                                                            originalDisplayValue &&
                                                            'bg-primary/10',
                                                    )}
                                                >
                                                    {effectiveDisplayValue}
                                                </TableCell>
                                            );
                                        })}
                                        {showResolutionColumn && (
                                            <TableCell className="border-border bg-background sticky right-0 z-20 border">
                                                {row.hasConflict && (
                                                    <ConflictResolutionControl
                                                        fieldType={
                                                            row.fieldType
                                                        }
                                                        options={
                                                            resolutionOptions
                                                        }
                                                        value={chosenResolution}
                                                        onValueChange={value =>
                                                            onConflictResolutionChange(
                                                                row.id,
                                                                value,
                                                            )
                                                        }
                                                        disabled={isRowDisabled}
                                                    />
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                );
                            })}
                        </Fragment>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
