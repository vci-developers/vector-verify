'use client';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/utils/cn';
import { ChevronRight } from 'lucide-react';

interface CollapsibleLocationGroupProps {
    locationName: string;
    locationTypeName: string;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    summaryContent: React.ReactNode;
    prefixContent?: React.ReactNode;
    headerClassName?: string;
}

export default function CollapsibleLocationGroup({
    locationName,
    locationTypeName,
    isExpanded,
    onToggle,
    children,
    summaryContent,
    prefixContent,
    headerClassName,
}: CollapsibleLocationGroupProps) {
    return (
        <Collapsible open={isExpanded} onOpenChange={onToggle}>
            <div
                className={cn(
                    'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 transition-all',
                    headerClassName ?? 'hover:bg-muted/50',
                )}
            >
                {prefixContent && (
                    <div className="flex shrink-0 items-center">
                        {prefixContent}
                    </div>
                )}
                <CollapsibleTrigger className="flex flex-1 cursor-pointer items-center justify-between gap-2.5 text-left">
                    <div className="flex items-center gap-2.5">
                        <ChevronRight
                            className={cn(
                                'text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200',
                                { 'rotate-90': isExpanded },
                            )}
                        />
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-medium">
                                {locationName}
                            </span>
                            <span className="text-muted-foreground text-[11px]">
                                {locationTypeName}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {summaryContent}
                    </div>
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent>
                <div className="border-border/60 ml-4.5 border-l pl-4">
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
