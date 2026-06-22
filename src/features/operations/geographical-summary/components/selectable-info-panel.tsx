'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/utils/cn';

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

interface SelectableInfoPanelRowProps {
    isSelected: boolean;
    isLoading: boolean;
    onSelect: () => void;
    children: ReactNode;
}

export function SelectableInfoPanelRow({
    isSelected,
    isLoading,
    onSelect,
    children,
}: SelectableInfoPanelRowProps) {
    const rowRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (isSelected)
            rowRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
    }, [isSelected]);

    return (
        <Button
            ref={rowRef}
            variant="ghost"
            disabled={isLoading}
            onClick={onSelect}
            className={cn(
                'border-border block h-auto w-full justify-start rounded-none border-b px-3 py-2.5 text-left text-xs whitespace-normal transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                isSelected
                    ? 'bg-accent ring-primary hover:bg-accent ring-1 ring-inset'
                    : 'hover:bg-muted/40 cursor-pointer',
            )}
        >
            {children}
        </Button>
    );
}
