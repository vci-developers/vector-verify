'use client';

import type { SessionWithFormData } from '@/api/surveillance-form/validation/session-with-form-data-schema';
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
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import { normalizeSessionRows } from '@/features/review/utils/normalize-form-data';

interface SurveillanceFormReviewTableProps {
    sessions: SessionWithFormData[];
    conflictingLabels?: Set<string>;
    resolutions?: Map<string, string>;
    onResolutionChange?: (label: string, value: string) => void;
}

function getAllRowLabelsAcrossSessions(
    normalizedSessions: { label: string; value: string }[][],
): string[] {
    const addedLabels = new Set<string>();
    const labels: string[] = [];
    for (const rows of normalizedSessions) {
        for (const row of rows) {
            if (!addedLabels.has(row.label)) {
                addedLabels.add(row.label);
                labels.push(row.label);
            }
        }
    }
    return labels;
}

function getValueForLabel(
    rows: { label: string; value: string }[],
    label: string,
): string {
    return rows.find(row => row.label === label)?.value ?? 'No data';
}

function getDistinctSessionValuesForLabel(
    normalizedSessions: { label: string; value: string }[][],
    label: string,
): string[] {
    return Array.from(
        new Set(normalizedSessions.map(rows => getValueForLabel(rows, label))),
    );
}

export default function SurveillanceFormReviewTable({
    sessions,
    conflictingLabels = new Set<string>(),
    resolutions,
    onResolutionChange,
}: SurveillanceFormReviewTableProps) {
    if (sessions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-sm">
                    No sessions found for this site.
                </p>
            </div>
        );
    }

    const normalizedSessions = sessions.map(({ session, formData }) =>
        normalizeSessionRows(session, formData),
    );
    const allLabels = getAllRowLabelsAcrossSessions(normalizedSessions);
    const showResolutionColumn = conflictingLabels.size > 0;

    return (
        <div className="overflow-x-auto">
            <Table className="border-border rounded-md border">
                <TableHeader>
                    <TableRow className="h-14">
                        <TableHead className="border-border w-48 border" />
                        {sessions.map(({ session }) => (
                            <TableHead
                                key={session.sessionId}
                                className="border-border border"
                            >
                                {format(
                                    new Date(session.collectionDate),
                                    'MMM d, yyyy',
                                )}
                            </TableHead>
                        ))}
                        {showResolutionColumn && (
                            <TableHead className="border-border bg-background sticky right-0 z-20 border font-semibold">
                                Resolution
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allLabels.map(label => (
                        <TableRow
                            key={label}
                            className={cn(
                                'h-14',
                                conflictingLabels.has(label) &&
                                    !resolutions?.has(label) &&
                                    'bg-destructive/10 hover:bg-destructive/15',
                            )}
                        >
                            <TableCell className="border-border w-48 border font-medium">
                                <div className="flex items-center gap-2">
                                    {conflictingLabels.has(label) &&
                                        (resolutions?.has(label) ? (
                                            <CircleCheck className="h-4 w-4 shrink-0 text-green-600" />
                                        ) : (
                                            <TriangleAlert className="text-destructive h-4 w-4 shrink-0" />
                                        ))}
                                    {label}
                                </div>
                            </TableCell>
                            {normalizedSessions.map((rows, index) => (
                                <TableCell
                                    key={sessions[index]!.session.sessionId}
                                    className="border-border border"
                                >
                                    {getValueForLabel(rows, label)}
                                </TableCell>
                            ))}
                            {showResolutionColumn && (
                                <TableCell className="border-border bg-background sticky right-0 z-20 border">
                                    {conflictingLabels.has(label) ? (
                                        <Select
                                            value={resolutions?.get(label)}
                                            onValueChange={value =>
                                                onResolutionChange?.(
                                                    label,
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-40">
                                                <SelectValue placeholder="Select value" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getDistinctSessionValuesForLabel(
                                                    normalizedSessions,
                                                    label,
                                                ).map(distinctValue => (
                                                    <SelectItem
                                                        key={distinctValue}
                                                        value={distinctValue}
                                                    >
                                                        {distinctValue}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : null}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
