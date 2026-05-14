'use client';

import type { Site } from '@/api/site/validation/site-schema';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import { ChevronRight } from 'lucide-react';
import { isMonthFullySelected } from '@/features/review/export/utils/export-selection-helpers';
import { useExportMonthContext } from './export-month-row';

interface ExportCollapsibleLocationGroupProps {
    locationName: string;
    locationTypeName: string;
    sitesInGroup: Site[];
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export default function ExportCollapsibleLocationGroup({
    locationName,
    locationTypeName,
    sitesInGroup,
    isExpanded,
    onToggle,
    children,
}: ExportCollapsibleLocationGroupProps) {
    const {
        certifiedCountsBySiteId,
        selectedSiteIds,
        onToggleSites,
        isExporting,
    } = useExportMonthContext();

    const certifiedSitesInGroup = sitesInGroup.filter(
        site => (certifiedCountsBySiteId.get(site.siteId) ?? 0) > 0,
    );
    const certifiedSiteIds = new Set(
        certifiedSitesInGroup.map(site => site.siteId),
    );
    const certifiedTotal = certifiedSitesInGroup.length;

    if (certifiedTotal === 0) return null;

    const isChecked = isMonthFullySelected(certifiedSiteIds, selectedSiteIds);

    function handleCheckboxChange() {
        onToggleSites([...certifiedSiteIds], !isChecked);
    }

    return (
        <Collapsible open={isExpanded} onOpenChange={onToggle}>
            <CollapsibleTrigger className="w-full">
                <div className="group hover:bg-muted/50 flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition-all">
                    <div className="flex items-center gap-2.5">
                        <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isExporting}
                            onChange={handleCheckboxChange}
                            onClick={event => event.stopPropagation()}
                            className={cn(
                                'h-4 w-4',
                                isExporting
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'cursor-pointer',
                            )}
                        />
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

                    <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs">
                            {certifiedTotal} certified
                        </Badge>
                    </div>
                </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <div className="border-border/60 ml-4.5 border-l pl-4">
                    {children}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
