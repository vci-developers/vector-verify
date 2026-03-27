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
import type { SessionWithForm } from '@/features/review/components/site-detail/surveillance-form-review/types';
import { format } from 'date-fns';

interface SurveillanceFormReviewTableProps {
    surveillanceForms: SessionWithForm[];
}

const DATA_FIELDS: {
    label: string;
    sessionKey?: keyof Session;
    render?: (session: Session, form: SurveillanceForm | null) => string;
}[] = [
    { label: 'Collector Name', sessionKey: 'collectorName' },
    { label: 'Collector Title', sessionKey: 'collectorTitle' },
    { label: 'Collection Method', sessionKey: 'collectionMethod' },
    {
        label: 'People in House',
        render: (_, form) =>
            form ? String(form.numPeopleSleptInHouse) : 'N/A',
    },
    {
        label: 'IRS Conducted',
        render: (_, form) =>
            form ? (form.wasIrsConducted ? 'Yes' : 'No') : 'N/A',
    },
    {
        label: 'Months Since IRS',
        render: (_, form) =>
            form ? (form.monthsSinceIrs?.toString() ?? 'N/A') : 'N/A',
    },
    {
        label: 'LLINs Available',
        render: (_, form) =>
            form ? String(form.numLlinsAvailable) : 'N/A',
    },
    {
        label: 'LLIN Type',
        render: (_, form) => form?.llinType ?? 'N/A',
    },
    {
        label: 'LLIN Brand',
        render: (_, form) => form?.llinBrand ?? 'N/A',
    },
    {
        label: 'People Under LLIN',
        render: (_, form) =>
            form
                ? (form.numPeopleSleptUnderLlin?.toString() ?? 'N/A')
                : 'N/A',
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
                        {surveillanceForms.map(({ session, form }) => {
                            let value: string;
                            if (field.render) {
                                value = field.render(session, form);
                            } else if (field.sessionKey) {
                                value = String(
                                    session[field.sessionKey] ?? 'N/A',
                                );
                            } else {
                                value = 'N/A';
                            }

                            return (
                                <TableCell
                                    key={session.sessionId}
                                    className="border-border border"
                                >
                                    {value}
                                </TableCell>
                            );
                        })}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
