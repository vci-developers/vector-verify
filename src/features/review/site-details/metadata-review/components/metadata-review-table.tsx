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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ComboBox } from '@/components/ui/combobox';
import { cn } from '@/utils/cn';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import type { MetadataRow } from '../utils/metadata-review-helpers';

interface MetadataReviewTableProps {
    sessions: Session[];
    metadataRows: MetadataRow[];
    sessionLabelBySessionId: Map<number, string>;
    sessionIdsWithoutSurveillanceForm: Set<number>;
    resolutionsByMetadataRowId: Map<string, string>;
    onConflictResolutionChange: (
        metadataRowId: string,
        chosenDisplayValue: string,
    ) => void;
    disabledRowIds: Set<string>;
}

function validateWholeNonNegativeInteger(value: string): string | null {
    if (value === 'N/A') return null;
    if (!/^\d+$/.test(value)) {
        return 'Must be a whole non-negative integer';
    }
    return null;
}

export default function MetadataReviewTable({
    sessions,
    metadataRows,
    sessionLabelBySessionId,
    sessionIdsWithoutSurveillanceForm,
    resolutionsByMetadataRowId,
    onConflictResolutionChange,
    disabledRowIds,
}: MetadataReviewTableProps) {
    const hasAnyConflict = metadataRows.some(row => row.variants.length > 1);

    return (
        <div className="overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="bg-muted sticky left-0 z-10 w-52 text-center font-semibold">
                            <span className="bg-border absolute inset-y-0 right-0 w-px" />
                            <span>Field</span>
                        </TableHead>
                        {sessions.map(session => (
                            <TableHead
                                key={session.sessionId}
                                className="bg-muted min-w-40 font-semibold"
                            >
                                <div className="flex flex-col items-center py-1">
                                    {sessionLabelBySessionId.get(
                                        session.sessionId,
                                    )}
                                    {sessionIdsWithoutSurveillanceForm.has(
                                        session.sessionId,
                                    ) && (
                                        <span className="text-warning mt-1 flex items-center gap-1 text-xs font-normal">
                                            <TriangleAlert className="size-3 shrink-0" />
                                            No surveillance form
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                        ))}
                        {hasAnyConflict && (
                            <TableHead className="bg-muted sticky right-0 z-10 min-w-44 text-center font-semibold">
                                <span className="bg-border absolute inset-y-0 left-0 w-px" />
                                <span>Resolution</span>
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {metadataRows.map(row => {
                        const hasConflict = row.variants.length > 1;
                        const isResolved = resolutionsByMetadataRowId.has(
                            row.id,
                        );
                        const isDisabled = disabledRowIds.has(row.id);
                        const chosenDisplayValue =
                            resolutionsByMetadataRowId.get(row.id);
                        const resolutionOptions = row.variants.map(
                            variant => variant.displayValue,
                        );
                        const displayValueBySessionId = new Map<
                            number,
                            string
                        >();
                        for (const variant of row.variants) {
                            for (const sessionId of variant.sessionIds) {
                                displayValueBySessionId.set(
                                    sessionId,
                                    variant.displayValue,
                                );
                            }
                        }

                        return (
                            <TableRow
                                key={row.id}
                                className="group hover:bg-muted"
                            >
                                <TableCell className="bg-background group-hover:bg-muted sticky left-0 z-10 font-medium">
                                    <span className="bg-border absolute inset-y-0 right-0 w-px" />
                                    {hasConflict && (
                                        <span
                                            className={cn(
                                                'absolute inset-y-0 left-0 w-0.5',
                                                isResolved
                                                    ? 'bg-success'
                                                    : 'bg-destructive',
                                            )}
                                        />
                                    )}
                                    <div className="flex items-center justify-center gap-2">
                                        {hasConflict &&
                                            (isResolved ? (
                                                <CircleCheck className="text-success size-4 shrink-0" />
                                            ) : (
                                                <TriangleAlert className="text-destructive size-4 shrink-0" />
                                            ))}
                                        {row.label}
                                    </div>
                                </TableCell>
                                {sessions.map(session => {
                                    const originalValue =
                                        displayValueBySessionId.get(
                                            session.sessionId,
                                        ) ?? 'N/A';
                                    const effectiveValue = isDisabled
                                        ? 'N/A'
                                        : (chosenDisplayValue ?? originalValue);
                                    const isOverridden =
                                        !isDisabled &&
                                        effectiveValue !== originalValue;
                                    return (
                                        <TableCell
                                            key={session.sessionId}
                                            className={cn(
                                                'text-center tabular-nums',
                                                isOverridden &&
                                                    'text-primary font-medium',
                                                isDisabled &&
                                                    'text-muted-foreground',
                                            )}
                                        >
                                            {effectiveValue}
                                        </TableCell>
                                    );
                                })}
                                {hasAnyConflict && (
                                    <TableCell className="bg-background group-hover:bg-muted sticky right-0 z-10">
                                        <span className="bg-border absolute inset-y-0 left-0 w-px" />
                                        {hasConflict && (
                                            <div className="flex justify-center">
                                                {row.fieldType === 'boolean' ? (
                                                    <Select
                                                        value={
                                                            isDisabled
                                                                ? 'N/A'
                                                                : chosenDisplayValue
                                                        }
                                                        onValueChange={value =>
                                                            onConflictResolutionChange(
                                                                row.id,
                                                                value,
                                                            )
                                                        }
                                                        disabled={isDisabled}
                                                    >
                                                        <SelectTrigger className="w-40">
                                                            <SelectValue placeholder="Select value" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {resolutionOptions.map(
                                                                option => (
                                                                    <SelectItem
                                                                        key={
                                                                            option
                                                                        }
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
                                                        options={
                                                            resolutionOptions
                                                        }
                                                        value={
                                                            isDisabled
                                                                ? 'N/A'
                                                                : chosenDisplayValue
                                                        }
                                                        onValueChange={value =>
                                                            onConflictResolutionChange(
                                                                row.id,
                                                                value,
                                                            )
                                                        }
                                                        placeholder="Select value"
                                                        validate={
                                                            row.fieldType ===
                                                            'number'
                                                                ? validateWholeNonNegativeInteger
                                                                : undefined
                                                        }
                                                        disabled={isDisabled}
                                                    />
                                                )}
                                            </div>
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
