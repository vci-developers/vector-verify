'use client';

import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { format } from 'date-fns';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DATA_FIELDS,
    formatFieldValue,
    type ConflictMap,
    type SessionWithForm,
} from '@/features/review/utils/surveillance-form-fields';

interface SurveillanceFormReviewTableProps {
    surveillanceForms: SessionWithForm[];
    conflicts: ConflictMap;
    resolutions: Record<string, string>;
    onResolve: (fieldKey: string, displayValue: string) => void;
}

interface ResolveDropdownProps {
    fieldKey: string;
    reportedValues: Array<{ label: string; value: unknown }>;
    resolved: string | undefined;
    otherAllowed: 'string' | 'number' | false;
    onResolve: (fieldKey: string, displayValue: string) => void;
}

function ResolveDropdown({
    fieldKey,
    reportedValues,
    resolved,
    otherAllowed,
    onResolve,
}: ResolveDropdownProps) {
    const [showOther, setShowOther] = useState(false);
    const [otherText, setOtherText] = useState('');

    const otherIsValid =
        otherAllowed === 'string' ||
        (otherAllowed === 'number' &&
            otherText !== '' &&
            !isNaN(Number(otherText)));

    if (showOther) {
        return (
            <div className="flex items-center gap-1">
                <Input
                    autoFocus
                    value={otherText}
                    onChange={e => setOtherText(e.target.value)}
                    className="h-8 w-32 text-sm"
                    placeholder={
                        otherAllowed === 'number' ? '0' : 'Enter value'
                    }
                />
                <Button
                    size="sm"
                    className="h-8 px-2"
                    disabled={!otherIsValid}
                    onClick={() => {
                        onResolve(fieldKey, otherText.trim());
                        setShowOther(false);
                        setOtherText('');
                    }}
                >
                    OK
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => {
                        setShowOther(false);
                        setOtherText('');
                    }}
                >
                    ✕
                </Button>
            </div>
        );
    }

    return (
        <Select
            value={resolved ?? ''}
            onValueChange={v => {
                if (v === '__other__') {
                    setShowOther(true);
                } else {
                    onResolve(fieldKey, v);
                }
            }}
        >
            <SelectTrigger className="h-8 w-36 text-sm">
                <SelectValue placeholder="Resolve" />
            </SelectTrigger>
            <SelectContent>
                {reportedValues.map(opt => (
                    <SelectItem key={opt.label} value={opt.label}>
                        {opt.label}
                    </SelectItem>
                ))}
                {otherAllowed !== false && (
                    <SelectItem value="__other__">Other...</SelectItem>
                )}
            </SelectContent>
        </Select>
    );
}

export default function SurveillanceFormReviewTable({
    surveillanceForms,
    conflicts,
    resolutions,
    onResolve,
}: SurveillanceFormReviewTableProps) {
    const hasActionColumn = Object.keys(conflicts).length > 0;

    return (
        <Table className="border-border rounded-md border">
            <TableHeader>
                <TableRow className="h-14">
                    <TableHead className="border-border w-48 border text-xs font-semibold tracking-wide uppercase">
                        Field Name
                    </TableHead>
                    {surveillanceForms.map(({ session }) => (
                        <TableHead
                            key={session.sessionId}
                            className="border-border border"
                        >
                            <div className="font-semibold">
                                {session.frontendId}
                            </div>
                            <div className="text-muted-foreground text-xs font-normal">
                                {format(
                                    new Date(session.collectionDate),
                                    'yyyy-MM-dd',
                                )}
                            </div>
                        </TableHead>
                    ))}
                    {hasActionColumn && (
                        <TableHead className="border-border border text-xs font-semibold tracking-wide uppercase">
                            Action
                        </TableHead>
                    )}
                </TableRow>
            </TableHeader>
            <TableBody>
                {DATA_FIELDS.map(field => {
                    const conflictInfo = conflicts[field.fieldKey];
                    const resolved = resolutions[field.fieldKey];

                    return (
                        <TableRow key={field.fieldKey} className="h-14">
                            <TableCell className="border-border w-48 border font-medium">
                                <div className="flex items-center gap-2">
                                    {conflictInfo !== undefined && (
                                        <TriangleAlert className="text-destructive h-4 w-4 shrink-0" />
                                    )}
                                    {field.label}
                                </div>
                            </TableCell>
                            {surveillanceForms.map(({ session, form }) => {
                                const displayValue = formatFieldValue(
                                    field.getValue(session, form),
                                );
                                const isOutlier =
                                    conflictInfo !== undefined &&
                                    (conflictInfo.majorityValue === null ||
                                        displayValue !==
                                            formatFieldValue(
                                                conflictInfo.majorityValue,
                                            ));

                                return (
                                    <TableCell
                                        key={session.sessionId}
                                        className={`border-border border ${isOutlier ? 'bg-destructive/10' : ''}`}
                                    >
                                        <span
                                            className={
                                                isOutlier
                                                    ? 'text-destructive font-semibold'
                                                    : ''
                                            }
                                        >
                                            {resolved !== undefined &&
                                            conflictInfo !== undefined
                                                ? resolved
                                                : displayValue}
                                        </span>
                                    </TableCell>
                                );
                            })}
                            {hasActionColumn && (
                                <TableCell className="border-border border">
                                    {conflictInfo !== undefined && (
                                        <ResolveDropdown
                                            fieldKey={field.fieldKey}
                                            reportedValues={conflictInfo.reportedValues}
                                            resolved={resolved}
                                            otherAllowed={field.otherAllowed}
                                            onResolve={onResolve}
                                        />
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
