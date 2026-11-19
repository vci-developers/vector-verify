'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CommandItem } from '@/components/ui/command';
import { useOperationsFilters } from '@/features/operations/view-state/use-operations-filters';
import {
    getCheckedState,
    getLocationLabel,
    getLocationRowChildSites,
    matchesLocationSearch,
    toggleSiteSelection,
} from '@/lib/location/location-tree';
import { cn } from '@/utils/cn';
import { ChevronRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface OperationsLocationTreeNodeProps {
    site: Site;
    search: string;
}

export default function OperationsLocationTreeNode({
    site,
    search,
}: OperationsLocationTreeNodeProps) {
    const t = useTranslations('Operations');
    const [{ selectedSiteIds }, setFilters] = useOperationsFilters();
    const { data: getUserPermissionsResult } = useGetUserPermissions();
    const [isOpen, setIsOpen] = useState(false);

    const accessibleSites = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.permissions.sites.canAccessSites
        : [];

    if (search && !matchesLocationSearch(accessibleSites, site, search)) {
        return null;
    }

    const label = getLocationLabel(accessibleSites, site);
    const childSites = getLocationRowChildSites(accessibleSites, site);
    const hasChildren = childSites.length > 0;
    const isExpanded = search !== '' || isOpen;

    return (
        <Collapsible open={isExpanded} onOpenChange={setIsOpen}>
            <CommandItem
                value={String(site.siteId)}
                onSelect={() =>
                    setFilters({
                        selectedSiteIds: toggleSiteSelection(
                            accessibleSites,
                            selectedSiteIds,
                            site.siteId,
                        ),
                    })
                }
            >
                {hasChildren && !search ? (
                    <CollapsibleTrigger asChild>
                        <button
                            type="button"
                            aria-label={t(
                                isExpanded
                                    ? 'collapseLocation'
                                    : 'expandLocation',
                                { name: label },
                            )}
                            onClick={event => event.stopPropagation()}
                        >
                            <ChevronRightIcon
                                className={cn(
                                    'size-4 transition-transform',
                                    isExpanded && 'rotate-90',
                                )}
                            />
                        </button>
                    </CollapsibleTrigger>
                ) : (
                    <span className="size-4" />
                )}
                <Checkbox
                    checked={getCheckedState(
                        accessibleSites,
                        selectedSiteIds,
                        site.siteId,
                    )}
                    tabIndex={-1}
                    className="pointer-events-none"
                />
                <span className={cn(hasChildren && 'font-medium')}>
                    {label}
                </span>
            </CommandItem>
            <CollapsibleContent className="border-border ml-4 border-l pl-2">
                {childSites.map(childSite => (
                    <OperationsLocationTreeNode
                        key={childSite.siteId}
                        site={childSite}
                        search={search}
                    />
                ))}
            </CollapsibleContent>
        </Collapsible>
    );
}
