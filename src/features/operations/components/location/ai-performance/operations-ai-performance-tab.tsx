import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Bot, Info } from 'lucide-react';

const SUMMARY_CARDS = [
    {
        label: 'Coverage',
        value: '87.5%',
        description: 'of specimens labeled',
        className:
            'border-emerald-400/80 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]',
    },
    {
        label: 'Validated Specimens',
        value: '896',
        description: 'total validated',
        className:
            'border-emerald-400/80 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]',
    },
    {
        label: 'Last Update',
        value: '2h ago',
        description: '2026-02-24 14:30',
        className: 'border-border',
    },
] as const;

const CONFUSION_MATRIX = [
    {
        label: 'An. gambiae s.s.',
        cells: [
            {
                value: '458',
                percent: '95%',
                className: 'bg-emerald-500 text-white',
            },
            {
                value: '12',
                percent: '2%',
                className: 'bg-rose-100 text-rose-700',
            },
            {
                value: '8',
                percent: '2%',
                className: 'bg-rose-50 text-rose-700',
            },
            {
                value: '5',
                percent: '1%',
                className: 'bg-rose-50 text-rose-700',
            },
        ],
    },
    {
        label: 'An. arabiensis',
        cells: [
            {
                value: '15',
                percent: '5%',
                className: 'bg-rose-300 text-rose-800',
            },
            {
                value: '256',
                percent: '89%',
                className: 'bg-emerald-500 text-white',
            },
            {
                value: '6',
                percent: '2%',
                className: 'bg-rose-200 text-rose-700',
            },
            {
                value: '10',
                percent: '3%',
                className: 'bg-rose-300 text-rose-800',
            },
        ],
    },
    {
        label: 'An. funestus',
        cells: [
            {
                value: '5',
                percent: '3%',
                className: 'bg-rose-200 text-rose-700',
            },
            {
                value: '8',
                percent: '6%',
                className: 'bg-rose-300 text-rose-800',
            },
            {
                value: '125',
                percent: '87%',
                className: 'bg-emerald-500 text-white',
            },
            {
                value: '5',
                percent: '3%',
                className: 'bg-rose-200 text-rose-700',
            },
        ],
    },
    {
        label: 'Culex sp.',
        cells: [
            { value: '8', percent: '9%', className: 'bg-rose-400 text-white' },
            {
                value: '11',
                percent: '13%',
                className: 'bg-rose-500 text-white',
            },
            {
                value: '4',
                percent: '5%',
                className: 'bg-rose-300 text-rose-800',
            },
            {
                value: '62',
                percent: '73%',
                className: 'bg-emerald-500 text-white',
            },
        ],
    },
] as const;

const CLASS_PERFORMANCE = [
    { label: 'An. gambiae s.s.', precision: '94.8%', recall: '97.2%' },
    { label: 'An. arabiensis', precision: '89.2%', recall: '91.5%' },
    { label: 'An. funestus', precision: '87.4%', recall: '90.3%' },
    { label: 'Culex sp.', precision: '72.9%', recall: '78.1%' },
] as const;

export default function OperationsAiPerformanceTab() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                <Info className="h-4 w-4" />
                <span>Metrics reflect only expert-validated specimens</span>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                {SUMMARY_CARDS.map(card => (
                    <Card
                        key={card.label}
                        className={`gap-0 py-0 ${card.className}`}
                    >
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-sm">
                                {card.label}
                            </p>
                            <p className="mt-1 text-4xl font-semibold tracking-tight">
                                {card.value}
                            </p>
                            <p className="text-muted-foreground mt-2 text-xs">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="gap-0">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Confusion Matrix</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="max-w-3xl">
                        <Table className="w-full table-fixed border-collapse overflow-hidden rounded-lg">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="bg-muted/40 h-12 w-1/5 border" />
                                    <TableHead
                                        className="bg-muted/40 h-12 border text-center font-semibold"
                                        colSpan={4}
                                    >
                                        AI Prediction
                                    </TableHead>
                                </TableRow>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="bg-muted/20 w-1/5 border text-center text-sm font-semibold">
                                        Ground Truth
                                    </TableHead>
                                    <TableHead className="bg-muted/20 w-1/5 border text-center text-xs font-semibold">
                                        An. gambiae s.s.
                                    </TableHead>
                                    <TableHead className="bg-muted/20 w-1/5 border text-center text-xs font-semibold">
                                        An. arabiensis
                                    </TableHead>
                                    <TableHead className="bg-muted/20 w-1/5 border text-center text-xs font-semibold">
                                        An. funestus
                                    </TableHead>
                                    <TableHead className="bg-muted/20 w-1/5 border text-center text-xs font-semibold">
                                        Culex sp.
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {CONFUSION_MATRIX.map(row => (
                                    <TableRow
                                        key={row.label}
                                        className="hover:bg-transparent"
                                    >
                                        <TableCell className="bg-background border text-center text-xs font-medium">
                                            {row.label}
                                        </TableCell>
                                        {row.cells.map((cell, cellIndex) => (
                                            <TableCell
                                                key={`${row.label}-${cellIndex}`}
                                                className={`border p-0 ${cell.className}`}
                                            >
                                                <div className="flex min-h-18 flex-col items-center justify-center px-2 py-3 text-center">
                                                    <span className="text-base font-semibold">
                                                        {cell.value}
                                                    </span>
                                                    <span className="text-[11px] font-medium opacity-90">
                                                        {cell.percent}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
                        <Card className="gap-0 border-0 py-0 shadow-none">
                            <CardHeader className="px-0 pb-3">
                                <CardTitle className="text-base">
                                    Overall Accuracy
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-0">
                                <div className="flex items-end gap-3">
                                    <span className="text-5xl font-semibold tracking-tight text-emerald-500">
                                        94.2%
                                    </span>
                                    <span className="text-muted-foreground pb-1 text-sm">
                                        901 correct out of 1024 predictions
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="gap-0 border-0 py-0 shadow-none">
                            <CardHeader className="px-0 pb-3">
                                <CardTitle className="text-base">
                                    Per-Class Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-0">
                                <div className="space-y-3">
                                    {CLASS_PERFORMANCE.map(item => (
                                        <div
                                            key={item.label}
                                            className="flex items-center justify-between gap-4 text-sm"
                                        >
                                            <div className="text-muted-foreground flex items-center gap-2">
                                                <Bot className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </div>
                                            <div className="font-medium">
                                                P: {item.precision} | R:{' '}
                                                {item.recall}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
