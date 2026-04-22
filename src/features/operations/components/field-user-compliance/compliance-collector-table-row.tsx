import { buildSessionSegments } from '@/features/operations/utils/build-session-segments';
import type { CollectorRow } from '@/features/operations/utils/field-user-compliance-data';

interface ComplianceCollectorTableRowProps {
    row: CollectorRow;
    monthKeys: string[];
    color: string;
}

export default function ComplianceCollectorTableRow({
    row,
    monthKeys,
    color,
}: ComplianceCollectorTableRowProps) {
    const sessionSegments = buildSessionSegments(
        monthKeys,
        row.sessionCountsByMonth,
    );

    return (
        <tr className="border-b last:border-0">
            <td className="bg-card sticky left-0 z-10 w-px px-4 py-3 whitespace-nowrap">
                <p className="text-sm leading-tight font-medium">
                    {row.collectorTitle}
                </p>
                <p className="text-muted-foreground text-xs">
                    {row.collectorName}
                </p>
            </td>
            {sessionSegments.map((segment, index) => {
                if (segment.type === 'empty') {
                    return <td key={index} colSpan={segment.span} />;
                }
                return (
                    <td
                        key={index}
                        colSpan={segment.span}
                        className="px-1.5 py-3"
                    >
                        <div
                            className="flex h-8 w-full items-center justify-center rounded-full px-4 text-sm font-medium text-white"
                            style={{ backgroundColor: color }}
                        >
                            {segment.totalCount} session
                            {segment.totalCount !== 1 ? 's' : ''}
                        </div>
                    </td>
                );
            })}
        </tr>
    );
}
