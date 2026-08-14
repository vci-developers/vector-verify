'use client';

import type { Session } from '@/api/session/validation/session-schema';
import { Button } from '@/components/ui/button';
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
import { CircleAlert, CircleCheck, Pencil, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';
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
    unmetRequiredRowIds: Set<string>;
    readOnly: boolean;
}

export default function MetadataReviewTable({
    sessions,
    timezone,
    sections,
    resolutionsByMetadataRowId,
    onConflictResolutionChange,
    disabledRowIds,
    unmetRequiredRowIds,
    readOnly,
}: MetadataReviewTableProps) {
    const t = useTranslations('ReviewMetadata');

    const [editingRowIds, setEditingRowIds] = useState<Set<string>>(new Set());

    const showSectionHeaders = sections.length > 1;
    const sectionHeaderColSpan = 1 + sessions.length + (readOnly ? 0 : 1);

    function startEditingRow(rowId: string) {
        setEditingRowIds(previousRowIds => new Set(previousRowIds).add(rowId));
    }

    return (
        <Table
            className="border-border rounded-md border"
            containerClassName="max-h-[calc(100vh-24rem)] overflow-y-auto"
        >
            <TableHeader className="bg-background sticky top-0 z-30">
                <TableRow className="h-14">
                    <TableHead className="border-border w-48 border" />
                    {sessions.map(session => (
                        <TableHead
                            key={session.sessionId}
                            className="border-border border p-2"
                        >
                            <div>
                                {t('collectionDate')}
                                {formatDateInTimezone(
                                    session.collectionDate,
                                    timezone,
                                    'MMM d, yyyy',
                                )}
                            </div>
                            <div>
                                {t('sessionCreated')}
                                <span className="block pl-4">
                                    {formatDateInTimezone(
                                        session.createdAt,
                                        timezone,
                                        'MMM d, yyyy h:mm a',
                                    )}
                                </span>
                            </div>
                        </TableHead>
                    ))}
                    {!readOnly && (
                        <TableHead className="border-border bg-background sticky right-0 z-40 w-72 border font-semibold">
                            {t('valueColumn')}
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
                                    {section.title ?? t('sessionSectionTitle')}
                                </TableCell>
                            </TableRow>
                        )}
                        {section.rows.map(row => {
                            const isRowDisabled = disabledRowIds.has(row.id);
                            const isUnmetRowRequired = unmetRequiredRowIds.has(
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
                                    [...row.fieldValueBySessionId.values()].map(
                                        formatDisplayValue,
                                    ),
                                ),
                            ];
                            const isUnitRow = section.title !== null;

                            const fallbackValue = row.hasConflict
                                ? undefined
                                : resolutionOptions[0];
                            const controlValue =
                                chosenResolution ??
                                (fallbackValue === NOT_APPLICABLE
                                    ? undefined
                                    : fallbackValue);
                            const showControl =
                                row.hasConflict ||
                                isUnmetRowRequired ||
                                editingRowIds.has(row.id) ||
                                resolutionsByMetadataRowId.has(row.id);

                            let RowIcon: typeof CircleAlert | null = null;
                            if (!readOnly) {
                                if (isUnmetRowRequired) {
                                    RowIcon = CircleAlert;
                                } else if (row.hasConflict) {
                                    RowIcon = isResolved
                                        ? CircleCheck
                                        : TriangleAlert;
                                }
                            }

                            return (
                                <TableRow
                                    key={row.id}
                                    className={cn(
                                        'h-14',
                                        !readOnly &&
                                            ((row.hasConflict && !isResolved) ||
                                                isUnmetRowRequired) &&
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
                                            {RowIcon && (
                                                <RowIcon
                                                    className={cn(
                                                        'h-4 w-4 shrink-0',
                                                        RowIcon === CircleCheck
                                                            ? 'text-green-600'
                                                            : 'text-destructive',
                                                    )}
                                                />
                                            )}
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
                                    {!readOnly && (
                                        <TableCell className="border-border bg-background sticky right-0 z-20 w-72 border">
                                            {isRowDisabled ? (
                                                <span className="text-muted-foreground pl-3 text-sm">
                                                    {NOT_APPLICABLE}
                                                </span>
                                            ) : showControl ? (
                                                <ConflictResolutionControl
                                                    fieldType={row.fieldType}
                                                    options={resolutionOptions}
                                                    questionOptions={
                                                        row.options
                                                    }
                                                    value={controlValue}
                                                    onValueChange={value =>
                                                        onConflictResolutionChange(
                                                            row.id,
                                                            value,
                                                        )
                                                    }
                                                    disabled={false}
                                                />
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    onClick={() =>
                                                        startEditingRow(row.id)
                                                    }
                                                    aria-label={t(
                                                        'editValueLabel',
                                                    )}
                                                    className="h-auto w-72 justify-between px-3 py-1.5 font-normal"
                                                >
                                                    <span className="truncate">
                                                        {controlValue ??
                                                            NOT_APPLICABLE}
                                                    </span>
                                                    <Pencil className="text-muted-foreground ml-2 h-3.5 w-3.5 shrink-0" />
                                                </Button>
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
    );
}
