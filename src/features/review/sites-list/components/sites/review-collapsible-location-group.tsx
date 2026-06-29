'use client';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ReviewCollapsibleLocationGroupProps {
    locationName: string;
    locationTypeName: string;
    children: React.ReactNode;
}

export default function ReviewCollapsibleLocationGroup({
    locationName,
    locationTypeName,
    children,
}: ReviewCollapsibleLocationGroupProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger className="group hover:bg-muted/50 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all">
                <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                <span className="text-sm font-medium">{locationName}</span>
                <span className="text-muted-foreground text-[11px]">
                    {locationTypeName}
                </span>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="border-border/60 ml-4.5 border-l pl-4">
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
