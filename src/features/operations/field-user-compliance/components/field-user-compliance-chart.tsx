'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { CollectorRow } from '@/features/operations/field-user-compliance/utils/field-user-compliance-data';
import { format } from 'date-fns';
import StatBadge from '@/components/ui/stat-badge';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import ComplianceCollectorTableRow from '@/features/operations/field-user-compliance/components/compliance-collector-table-row';

function buildChartPillColor(index: number, total: number): string {
    const startHue = 133;
    const endHue = 270;
    const hue =
        total <= 1
            ? startHue
            : startHue + ((endHue - startHue) * index) / (total - 1);
    return `hsl(${hue}, 55%, 45%)`;
}

interface FieldUserComplianceChartProps {
    months: Date[];
    collectorRows: CollectorRow[];
    totalCollectors: number;
    activeCollectors: number;
}

export default function FieldUserComplianceChart({
    months,
    collectorRows,
    totalCollectors,
    activeCollectors,
}: FieldUserComplianceChartProps) {
    const monthYearKeys = months.map(month => format(month, 'yyyy-MM'));
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Field Team Performance</CardTitle>
                    <div className="flex items-center gap-2">
                        <StatBadge
                            label="District Collectors"
                            value={totalCollectors}
                        />
                        <StatBadge
                            label="Active Collectors"
                            value={activeCollectors}
                            description="Submitted this or last month"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-6 py-0 pb-4">
                {collectorRows.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                        No submissions found for this location and date range.
                    </p>
                ) : (
                    <ScrollArea className="h-[45vh] w-full">
                        <div className="min-w-max">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-muted-foreground bg-card sticky top-0 left-0 z-20 w-px px-4 py-3 text-xs">
                                            Collector
                                        </TableHead>
                                        {months.map(month => (
                                            <TableHead
                                                key={format(month, 'yyyy-MM')}
                                                className="text-muted-foreground bg-card sticky top-0 z-10 min-w-20 px-1 py-2 text-center text-xs"
                                            >
                                                {format(month, 'MMM yy')}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {collectorRows.map((row, rowIndex) => (
                                        <ComplianceCollectorTableRow
                                            key={`${row.collectorName}/${row.collectorTitle}`}
                                            row={row}
                                            monthYearKeys={monthYearKeys}
                                            color={buildChartPillColor(
                                                rowIndex,
                                                collectorRows.length,
                                            )}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <ScrollBar orientation="horizontal" />
                        <ScrollBar orientation="vertical" />
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
