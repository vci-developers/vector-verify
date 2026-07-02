'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface SelectableInfoPanelRowProps {
    isSelected: boolean;
    isLoading: boolean;
    onSelect: () => void;
    children: ReactNode;
}

export default function SelectableInfoPanelRow({
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
