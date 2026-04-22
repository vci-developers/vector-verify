'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
    buildCollectorKey,
    type CollectorRow,
} from '@/features/operations/utils/field-user-compliance-data';

function buildChartPillColor(index: number, total: number): string {
    const startHue = 133;
    const endHue = 270;
    const hue =
        total <= 1
            ? startHue
            : startHue + ((endHue - startHue) * index) / (total - 1);
    return `hsl(${hue}, 55%, 45%)`;
}
import { format } from 'date-fns';
import StatBadge from '@/components/ui/stat-badge';
import ComplianceCollectorTableRow from '@/features/operations/components/field-user-compliance/compliance-collector-table-row';

interface FieldUserComplianceChartProps {
    months: Date[];
    monthKeys: string[];
    collectorRows: CollectorRow[];
    totalCollectors: number;
    activeCollectors: number;
}

export default function FieldUserComplianceChart({
    months,
    monthKeys,
    collectorRows,
    totalCollectors,
    activeCollectors,
}: FieldUserComplianceChartProps) {
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
                            tooltip="Submitted this or last month"
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
                    <ScrollArea className="w-full">
                        <div className="min-w-max">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-muted-foreground bg-card sticky left-0 z-10 w-px px-4 py-3 text-left text-xs font-medium whitespace-nowrap">
                                            Collector
                                        </th>
                                        {months.map(month => (
                                            <th
                                                key={format(month, 'yyyy-MM')}
                                                className="text-muted-foreground min-w-20 px-1 py-2 text-center text-xs font-medium whitespace-nowrap"
                                            >
                                                {format(month, 'MMM yy')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {collectorRows.map((row, rowIndex) => (
                                        <ComplianceCollectorTableRow
                                            key={buildCollectorKey(
                                                row.collectorTitle,
                                                row.collectorName,
                                            )}
                                            row={row}
                                            monthKeys={monthKeys}
                                            color={buildChartPillColor(
                                                rowIndex,
                                                collectorRows.length,
                                            )}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
