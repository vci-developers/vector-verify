'use client';

import type { Site } from '@/api/site/validation/site-schema';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { MultiSelect, MultiSelectTrigger } from '@/components/ui/multi-select';
import { PopoverContent } from '@/components/ui/popover';
import { useOperationsFilters } from '@/features/operations/view-state/use-operations-filters';
import {
    buildLocationTreeRows,
    getLocationCheckStates,
    toggleLocationInSelection,
    type LocationCheckState,
} from '@/features/operations/utils/location-tree-selection';
import { ALL_LOCATIONS_OPTION } from '@/lib/location/use-location-multiselection';
import {
    getSiteAndDescendants,
    getTopLevelSites,
} from '@/lib/location/site-tree';
import { cn } from '@/utils/cn';
import { CheckIcon, ChevronRightIcon, MinusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

function matchesSearch(
    _value: string,
    search: string,
    keywords: string[] = [],
): number {
    const normalizedSearch = search.toLocaleLowerCase();
    return keywords.some(keyword =>
        keyword.toLocaleLowerCase().includes(normalizedSearch),
    )
        ? 1
        : 0;
}

function CheckStateIcon({
    checkState,
}: {
    checkState: LocationCheckState | undefined;
}) {
    return (
        <span
            aria-hidden
            className={cn(
                'border-input flex size-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs',
                checkState &&
                    'bg-primary border-primary text-primary-foreground',
            )}
        >
            {checkState === 'checked' && (
                <CheckIcon className="text-primary-foreground size-3.5" />
            )}
            {checkState === 'indeterminate' && (
                <MinusIcon className="text-primary-foreground size-3.5" />
            )}
        </span>
    );
}

interface OperationsLocationTreeSelectProps {
    accessibleSites: Site[];
    locationTypeName: string;
}

export default function OperationsLocationTreeSelect({
    accessibleSites,
    locationTypeName,
}: OperationsLocationTreeSelectProps) {
    const t = useTranslations('Operations');
    const tCommon = useTranslations('Common');
    const [{ selectedLocations }, setFilters] = useOperationsFilters();
    const [search, setSearch] = useState('');
    const [expandedSiteIds, setExpandedSiteIds] = useState(new Set<number>());

    const isAllLocationsSelected =
        selectedLocations.includes(ALL_LOCATIONS_OPTION);
    const selectedSites = useMemo(
        () =>
            isAllLocationsSelected
                ? getTopLevelSites(accessibleSites)
                : accessibleSites.filter(site =>
                      selectedLocations.includes(String(site.siteId)),
                  ),
        [isAllLocationsSelected, accessibleSites, selectedLocations],
    );
    const checkStateBySiteId = useMemo(
        () =>
            getLocationCheckStates(
                accessibleSites,
                selectedSites.map(site => site.siteId),
            ),
        [accessibleSites, selectedSites],
    );
    const treeRows = useMemo(
        () =>
            buildLocationTreeRows(
                accessibleSites,
                search ? 'all' : expandedSiteIds,
            ),
        [accessibleSites, search, expandedSiteIds],
    );

    function handleToggleAllLocations() {
        setFilters({
            selectedLocations: isAllLocationsSelected
                ? []
                : [ALL_LOCATIONS_OPTION],
        });
    }

    function handleToggleLocation(siteId: number) {
        setFilters({
            selectedLocations: toggleLocationInSelection(
                accessibleSites,
                selectedSites.map(site => site.siteId),
                siteId,
            ).map(String),
        });
    }

    function handleToggleExpanded(siteId: number) {
        setExpandedSiteIds(previousExpandedSiteIds => {
            const nextExpandedSiteIds = new Set(previousExpandedSiteIds);
            const isExpanding = !nextExpandedSiteIds.has(siteId);
            for (const site of getSiteAndDescendants(accessibleSites, siteId)) {
                if (isExpanding) {
                    nextExpandedSiteIds.add(site.siteId);
                } else {
                    nextExpandedSiteIds.delete(site.siteId);
                }
            }
            return nextExpandedSiteIds;
        });
    }

    const triggerLabel = isAllLocationsSelected
        ? t('allLocations')
        : selectedSites.map(site => site.name).join(', ');

    return (
        <MultiSelect>
            <MultiSelectTrigger className="w-52">
                <span
                    className={cn(
                        'min-w-0 truncate',
                        !triggerLabel && 'text-muted-foreground font-normal',
                    )}
                >
                    {triggerLabel ||
                        t('selectDropdownPlaceholder', {
                            locationType: locationTypeName.toLocaleLowerCase(),
                        })}
                </span>
            </MultiSelectTrigger>
            <PopoverContent className="min-w-(--radix-popover-trigger-width) p-0">
                <Command filter={matchesSearch}>
                    <CommandInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder={t('searchLocationPlaceholder', {
                            locationType: locationTypeName.toLocaleLowerCase(),
                        })}
                    />
                    <CommandList>
                        <CommandEmpty>{tCommon('noResults')}</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value={ALL_LOCATIONS_OPTION}
                                keywords={[t('allLocations')]}
                                onSelect={handleToggleAllLocations}
                            >
                                <CheckStateIcon
                                    checkState={
                                        isAllLocationsSelected
                                            ? 'checked'
                                            : undefined
                                    }
                                />
                                {t('allLocations')}
                            </CommandItem>
                            {treeRows.map(
                                ({
                                    site,
                                    depth,
                                    hasChildren,
                                    searchKeywords,
                                }) => (
                                    <CommandItem
                                        key={site.siteId}
                                        value={String(site.siteId)}
                                        keywords={searchKeywords}
                                        onSelect={() =>
                                            handleToggleLocation(site.siteId)
                                        }
                                    >
                                        {Array.from(
                                            { length: depth },
                                            (_, guideIndex) => (
                                                <span
                                                    key={guideIndex}
                                                    aria-hidden
                                                    className="border-border -my-1.5 ml-2 w-2 self-stretch border-l"
                                                />
                                            ),
                                        )}
                                        {hasChildren && !search ? (
                                            <button
                                                type="button"
                                                aria-label={t(
                                                    expandedSiteIds.has(
                                                        site.siteId,
                                                    )
                                                        ? 'collapseLocation'
                                                        : 'expandLocation',
                                                    { name: site.name ?? '' },
                                                )}
                                                onClick={event => {
                                                    event.stopPropagation();
                                                    handleToggleExpanded(
                                                        site.siteId,
                                                    );
                                                }}
                                            >
                                                <ChevronRightIcon
                                                    className={cn(
                                                        'size-4 transition-transform',
                                                        expandedSiteIds.has(
                                                            site.siteId,
                                                        ) && 'rotate-90',
                                                    )}
                                                />
                                            </button>
                                        ) : (
                                            <span className="size-4" />
                                        )}
                                        <CheckStateIcon
                                            checkState={checkStateBySiteId.get(
                                                site.siteId,
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                hasChildren && 'font-medium',
                                            )}
                                        >
                                            {site.name}
                                        </span>
                                    </CommandItem>
                                ),
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </MultiSelect>
    );
}
