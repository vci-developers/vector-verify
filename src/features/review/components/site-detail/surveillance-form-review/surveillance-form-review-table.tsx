'use client';

import type {
    FormRow,
    SessionWithRows,
} from '@/api/surveillance-form/validation/session-with-rows-schema';
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

interface SurveillanceFormReviewTableProps {
    surveillanceForms: SessionWithRows[];
}

function getAllLabels(forms: SessionWithRows[]): string[] {
    const addedLabels = new Set<string>();
    const labels: string[] = [];
    for (const { rows } of forms) {
        if (!rows) continue;
        for (const row of rows) {
            if (!addedLabels.has(row.label)) {
                addedLabels.add(row.label);
                labels.push(row.label);
            }
        }
    }
    return labels;
}

function getValueForLabel(rows: FormRow[] | null, label: string): string {
    if (!rows) return 'No data';
    return rows.find(row => row.label === label)?.value ?? 'No data';
}

const SESSION_FIELDS: {
    label: string;
    render: (session: Session) => string;
}[] = [
    { label: 'Collector Name', render: session => session.collectorName },
    { label: 'Collector Title', render: session => session.collectorTitle },
    {
        label: 'Collection Method',
        render: session => session.collectionMethod,
    },
];

export default function SurveillanceFormReviewTable({
    surveillanceForms,
}: SurveillanceFormReviewTableProps) {
    if (surveillanceForms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-sm">
                    No sessions found for this site.
                </p>
            </div>
        );
    }

    const formLabels = getAllLabels(surveillanceForms);

    return (
        <Table className="border-border rounded-md border">
            <TableHeader>
                <TableRow className="h-14">
                    <TableHead className="border-border w-48 border" />
                    {surveillanceForms.map(({ session }) => (
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
                </TableRow>
            </TableHeader>
            <TableBody>
                {SESSION_FIELDS.map(field => (
                    <TableRow key={field.label} className="h-14">
                        <TableCell className="border-border w-48 border font-medium">
                            {field.label}
                        </TableCell>
                        {surveillanceForms.map(({ session }) => (
                            <TableCell
                                key={session.sessionId}
                                className="border-border border"
                            >
                                {field.render(session)}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
                {formLabels.map(label => (
                    <TableRow key={label} className="h-14">
                        <TableCell className="border-border w-48 border font-medium">
                            {label}
                        </TableCell>
                        {surveillanceForms.map(({ session, rows }) => (
                            <TableCell
                                key={session.sessionId}
                                className="border-border border"
                            >
                                {getValueForLabel(rows, label)}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
