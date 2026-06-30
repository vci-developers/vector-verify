'use client';

import { type ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SelectableInfoPanelProps {
    countLabel: string;
    children: ReactNode;
}

export default function SelectableInfoPanel({
    countLabel,
    children,
}: SelectableInfoPanelProps) {
    return (
        <div className="border-border flex h-full w-72 shrink-0 flex-col border-l">
            <div className="border-border border-b px-3 py-2">
                <p className="text-sm font-medium">{countLabel}</p>
            </div>
            <ScrollArea className="min-h-0 flex-1">{children}</ScrollArea>
        </div>
    );
}
