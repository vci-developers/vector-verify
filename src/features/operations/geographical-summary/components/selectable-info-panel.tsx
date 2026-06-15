'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/utils/cn';

interface SelectableInfoPanelProps<TItem> {
    items: TItem[];
    getItemId: (item: TItem) => string;
    selectedMarkerId: string | null;
    onMarkerSelect: (id: string | null) => void;
    isLoading: boolean;
    countLabel: string;
    renderRow: (item: TItem, isSelected: boolean) => ReactNode;
}

export default function SelectableInfoPanel<TItem>({
    items,
    getItemId,
    selectedMarkerId,
    onMarkerSelect,
    isLoading,
    countLabel,
    renderRow,
}: SelectableInfoPanelProps<TItem>) {
    const panelItemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    useEffect(() => {
        if (!selectedMarkerId) return;
        panelItemRefs.current
            .get(selectedMarkerId)
            ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [selectedMarkerId]);

    return (
        <div className="border-border flex h-full w-72 shrink-0 flex-col border-l">
            <div className="border-border border-b px-3 py-2">
                <p className="text-sm font-medium">{countLabel}</p>
            </div>
            <ScrollArea className="min-h-0 flex-1">
                {items.map(item => {
                    const itemId = getItemId(item);
                    const isSelected = selectedMarkerId === itemId;

                    return (
                        <button
                            key={itemId}
                            ref={panelItem => {
                                if (panelItem)
                                    panelItemRefs.current.set(
                                        itemId,
                                        panelItem,
                                    );
                                else panelItemRefs.current.delete(itemId);
                            }}
                            disabled={isLoading}
                            onClick={() =>
                                onMarkerSelect(isSelected ? null : itemId)
                            }
                            className={cn(
                                'border-border w-full border-b px-3 py-2.5 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                                isSelected
                                    ? 'bg-accent ring-primary ring-1 ring-inset'
                                    : 'hover:bg-muted/40 cursor-pointer',
                            )}
                        >
                            {renderRow(item, isSelected)}
                        </button>
                    );
                })}
            </ScrollArea>
        </div>
    );
}
