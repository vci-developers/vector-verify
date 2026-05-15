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
}

function validateNumberInput(value: string): string | null {
    if (value === 'N/A') return null;
    if (!/^\d+$/.test(value) || parseInt(value, 10) < 1) {
        return 'Must be a whole positive integer';
    }
    return null;
}

export default function MetadataReviewTable({
    sessions,
    metadataRows,
    sessionIdsWithoutSurveillanceForm,
    resolutionsByMetadataRowId,
    onConflictResolutionChange,
}: MetadataReviewTableProps) {
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
                                {sessions.map(session => (
                                    <TableCell
                                        key={session.sessionId}
                                        className="border-border border"
                                    >
                                        {formatDisplayValue(
                                            metadataRow.fieldValueBySessionId.get(
                                                session.sessionId,
                                            ),
                                        )}
                                    </TableCell>
                                ))}
                                {hasAnyConflict && (
                                    <TableCell className="border-border bg-background sticky right-0 z-20 border">
                                        {metadataRow.hasConflict &&
                                            (booleanFieldNames.has(
                                                metadataRow.fieldName,
                                            ) ? (
                                                <Select
                                                    value={resolutionsByMetadataRowId.get(
                                                        metadataRow.id,
                                                    )}
                                                    onValueChange={value =>
                                                        onConflictResolutionChange(
                                                            metadataRow.id,
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="w-40">
                                                        <SelectValue placeholder="Select value" />
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
                                                    value={resolutionsByMetadataRowId.get(
                                                        metadataRow.id,
                                                    )}
                                                    onValueChange={value =>
                                                        onConflictResolutionChange(
                                                            metadataRow.id,
                                                            value,
                                                        )
                                                    }
                                                    placeholder="Select value"
                                                    validate={
                                                        numberFieldNames.has(
                                                            metadataRow.fieldName,
                                                        )
                                                            ? validateNumberInput
                                                            : undefined
                                                    }
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
