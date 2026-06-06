'use client';

import { Badge } from '@/components/ui/badge';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Table, TableBody } from '@/components/ui/table';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Dhis2CycleSegmentProps {
    label: string;
    siteCount: number;
    submittedCount: number;
    children: React.ReactNode;
}

export default function Dhis2CycleSegment({
    label,
    siteCount,
    submittedCount,
    children,
}: Dhis2CycleSegmentProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger className="group flex w-full items-center gap-2 py-3">
                <ChevronRight className="text-muted-foreground h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                    {label}
                </span>
                <Badge variant="secondary" className="ml-1 tabular-nums">
                    {submittedCount} / {siteCount} submitted
                </Badge>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <Table>
                    <TableBody>{children}</TableBody>
                </Table>
            </CollapsibleContent>
        </Collapsible>
    );
}
