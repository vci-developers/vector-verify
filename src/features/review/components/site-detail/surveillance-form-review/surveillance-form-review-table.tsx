'use client';

import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

interface SessionWithForm {
    session: Session;
    form: SurveillanceForm | null;
}

interface SurveillanceFormReviewTableProps {
    surveillanceForms: SessionWithForm[];
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
}

const DATA_FIELDS: {
    label: string;
    render: (session: Session, form: SurveillanceForm | null) => string;
}[] = [
    {
        label: 'Collector Name',
        render: session => formatValue(session.collectorName),
    },
    {
        label: 'Collector Title',
        render: session => formatValue(session.collectorTitle),
    },
    {
        label: 'Collection Method',
        render: session => formatValue(session.collectionMethod),
    },
    {
        label: 'People in House',
        render: (_, form) => formatValue(form?.numPeopleSleptInHouse),
    },
    {
        label: 'IRS Conducted',
        render: (_, form) => formatValue(form?.wasIrsConducted),
    },
    {
        label: 'Months Since IRS',
        render: (_, form) => formatValue(form?.monthsSinceIrs),
    },
    {
        label: 'LLINs Available',
        render: (_, form) => formatValue(form?.numLlinsAvailable),
    },
    { label: 'LLIN Type', render: (_, form) => formatValue(form?.llinType) },
    { label: 'LLIN Brand', render: (_, form) => formatValue(form?.llinBrand) },
    {
        label: 'People Under LLIN',
        render: (_, form) => formatValue(form?.numPeopleSleptUnderLlin),
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
                {DATA_FIELDS.map(field => (
                    <TableRow key={field.label} className="h-14">
                        <TableCell className="border-border w-48 border font-medium">
                            {field.label}
                        </TableCell>
                        {surveillanceForms.map(({ session, form }) => (
                            <TableCell
                                key={session.sessionId}
                                className="border-border border"
                            >
                                {field.render(session, form)}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
