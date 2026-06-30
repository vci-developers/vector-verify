'use client';

import type { Session } from '@/api/session/validation/session-schema';
import { ComboBox } from '@/components/ui/combobox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import {
    formatDisplayValue,
    NOT_APPLICABLE,
    type MetadataRow,
} from '../utils/metadata-row';

interface MetadataReviewTableProps {
    sessions: Session[];
    timezone: string | null;
    metadataRows: MetadataRow[];
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
    metadataRows,
    resolutionsByMetadataRowId,
    onConflictResolutionChange,
    disabledRowIds,
    readOnly,
}: MetadataReviewTableProps) {
    const t = useTranslations('ReviewMetadata');

    function validateWholeNonNegativeInteger(value: string): string | null {
        if (value === NOT_APPLICABLE) return null;
        return /^\d+$/.test(value) ? null : t('wholeNonNegativeIntegerError');
    }

    const showResolutionColumn =
        !readOnly && metadataRows.some(metadataRow => metadataRow.hasConflict);

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
                    {metadataRows.map(metadataRow => {
                        const isResolved = resolutionsByMetadataRowId.has(
                            metadataRow.id,
                        );
                        const isRowDisabled = disabledRowIds.has(
                            metadataRow.id,
                        );
                        const chosenResolution = isRowDisabled
                            ? NOT_APPLICABLE
                            : resolutionsByMetadataRowId.get(metadataRow.id);
                        const resolutionOptions = [
                            ...new Set(
                                [
                                    ...metadataRow.fieldValueBySessionId.values(),
                                ].map(formatDisplayValue),
                            ),
                        ];

                        return (
                            <TableRow
                                key={metadataRow.id}
                                className={cn(
                                    'h-14',
                                    metadataRow.hasConflict &&
                                        !isResolved &&
                                        !readOnly &&
                                        'bg-destructive/10 hover:bg-destructive/15',
                                )}
                            >
                                <TableCell className="border-border w-48 border font-medium">
                                    <div className="flex items-center gap-2">
                                        {metadataRow.hasConflict &&
                                            !readOnly &&
                                            (isResolved ? (
                                                <CircleCheck className="h-4 w-4 shrink-0 text-green-600" />
                                            ) : (
                                                <TriangleAlert className="text-destructive h-4 w-4 shrink-0" />
                                            ))}
                                        {metadataRow.label}
                                    </div>
                                </TableCell>
                                {sessions.map(session => {
                                    const originalDisplayValue =
                                        formatDisplayValue(
                                            metadataRow.fieldValueBySessionId.get(
                                                session.sessionId,
                                            ),
                                        );
                                    const effectiveDisplayValue = isRowDisabled
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
                                        {metadataRow.hasConflict &&
                                            (metadataRow.fieldType ===
                                            'boolean' ? (
                                                <Select
                                                    value={chosenResolution}
                                                    onValueChange={value =>
                                                        onConflictResolutionChange(
                                                            metadataRow.id,
                                                            value,
                                                        )
                                                    }
                                                    disabled={isRowDisabled}
                                                >
                                                    <SelectTrigger className="w-40">
                                                        <SelectValue
                                                            placeholder={t(
                                                                'selectValuePlaceholder',
                                                            )}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {resolutionOptions.map(
                                                            option => (
                                                                <SelectItem
                                                                    key={option}
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {option}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <ComboBox
                                                    options={resolutionOptions}
                                                    value={chosenResolution}
                                                    onValueChange={value =>
                                                        onConflictResolutionChange(
                                                            metadataRow.id,
                                                            value,
                                                        )
                                                    }
                                                    placeholder={t(
                                                        'selectValuePlaceholder',
                                                    )}
                                                    validate={
                                                        metadataRow.fieldType ===
                                                        'number'
                                                            ? validateWholeNonNegativeInteger
                                                            : undefined
                                                    }
                                                    disabled={isRowDisabled}
                                                />
                                            ))}
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
