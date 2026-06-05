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
import { format } from 'date-fns';
import { cn } from '@/utils/cn';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ComboBox } from '@/components/ui/combobox';
import {
    booleanFieldNames,
    formatDisplayValue,
    numberFieldNames,
    type MetadataRow,
} from '@/features/review/site-details/metadata-review/utils/metadata-review-helpers';

interface MetadataReviewTableProps {
    sessions: Session[];
    metadataRows: MetadataRow[];
    sessionIdsWithoutSurveillanceForm: Set<number>;
    resolutionsByMetadataRowId: Map<string, string>;
    onConflictResolutionChange: (
        metadataRowId: string,
        chosenDisplayValue: string,
    ) => void;
    disabledRowIds: Set<string>;
}

export default function MetadataReviewTable({
    sessions,
    metadataRows,
    sessionIdsWithoutSurveillanceForm,
    resolutionsByMetadataRowId,
    onConflictResolutionChange,
    disabledRowIds,
}: MetadataReviewTableProps) {
    function validateWholePositiveInteger(value: string): string | null {
        if (value === 'N/A') return null;
        if (!/^\d+$/.test(value) || parseInt(value, 10) < 1) {
            return 'Must be a whole positive integer';
        }
        return null;
    }

    function validateWholeNonNegativeInteger(value: string): string | null {
        if (value === 'N/A') return null;
        if (!/^\d+$/.test(value)) {
            return 'Must be a whole non-negative integer';
        }
        return null;
    }

    function renderConflictControl(
        row: MetadataRow,
        isRowDisabled: boolean,
    ): React.ReactNode {
        const currentValue = isRowDisabled
            ? 'N/A'
            : resolutionsByMetadataRowId.get(row.id);
        const options = [
            ...new Set(
                [...row.fieldValueBySessionId.values()].map(formatDisplayValue),
            ),
        ];

        const isBoolean =
            row.entity === 'formAnswer'
                ? row.dataType === 'boolean'
                : booleanFieldNames.has(row.fieldName);

        if (isBoolean) {
            return (
                <Select
                    value={currentValue}
                    onValueChange={value =>
                        onConflictResolutionChange(row.id, value)
                    }
                    disabled={isRowDisabled}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map(option => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        const validate =
            row.entity === 'formAnswer'
                ? row.dataType === 'number'
                    ? validateWholePositiveInteger
                    : undefined
                : row.fieldName === 'numLlinsAvailable'
                  ? validateWholeNonNegativeInteger
                  : numberFieldNames.has(row.fieldName)
                    ? validateWholePositiveInteger
                    : undefined;

        return (
            <ComboBox
                options={options}
                value={currentValue}
                onValueChange={value =>
                    onConflictResolutionChange(row.id, value)
                }
                placeholder="Select value"
                validate={validate}
                disabled={isRowDisabled}
            />
        );
    }

    const hasAnyConflict = metadataRows.some(
        metadataRow => metadataRow.hasConflict,
    );

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
                                {format(
                                    new Date(session.collectionDate),
                                    'MMM d, yyyy',
                                )}
                                {sessionIdsWithoutSurveillanceForm.has(
                                    session.sessionId,
                                ) && (
                                    <h1>
                                        Warning: No Surveillance form found for
                                        this session
                                    </h1>
                                )}
                            </TableHead>
                        ))}
                        {hasAnyConflict && (
                            <TableHead className="border-border bg-background sticky right-0 z-20 border font-semibold">
                                Resolution
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {metadataRows.map(metadataRow => {
                        const isResolved = resolutionsByMetadataRowId.has(
                            metadataRow.id,
                        );
                        const isDisabled = disabledRowIds.has(metadataRow.id);

                        return (
                            <TableRow
                                key={metadataRow.id}
                                className={cn(
                                    'h-14',
                                    metadataRow.hasConflict &&
                                        !isResolved &&
                                        'bg-destructive/10 hover:bg-destructive/15',
                                )}
                            >
                                <TableCell className="border-border w-48 border font-medium">
                                    <div className="flex items-center gap-2">
                                        {metadataRow.hasConflict &&
                                            (isResolved ? (
                                                <CircleCheck className="h-4 w-4 shrink-0 text-green-600" />
                                            ) : (
                                                <TriangleAlert className="text-destructive h-4 w-4 shrink-0" />
                                            ))}
                                        {metadataRow.label}
                                    </div>
                                </TableCell>
                                {sessions.map(session => {
                                    const originalValue = formatDisplayValue(
                                        metadataRow.fieldValueBySessionId.get(
                                            session.sessionId,
                                        ),
                                    );
                                    const effectiveValue = isDisabled
                                        ? 'N/A'
                                        : (resolutionsByMetadataRowId.get(
                                              metadataRow.id,
                                          ) ?? originalValue);
                                    return (
                                        <TableCell
                                            key={session.sessionId}
                                            className={cn(
                                                'border-border border',
                                                effectiveValue !==
                                                    originalValue &&
                                                    'bg-primary/10',
                                            )}
                                        >
                                            {effectiveValue}
                                        </TableCell>
                                    );
                                })}
                                {hasAnyConflict && (
                                    <TableCell className="border-border bg-background sticky right-0 z-20 border">
                                        {metadataRow.hasConflict &&
                                            renderConflictControl(
                                                metadataRow,
                                                isDisabled,
                                            )}
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
