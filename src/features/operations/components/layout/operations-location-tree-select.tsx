'use client';

import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import OperationsLocationTreeNode from '@/features/operations/components/layout/operations-location-tree-node';
import {
    MultiSelect,
    MultiSelectTrigger,
    MultiSelectValue,
} from '@/components/ui/multi-select';
import { PopoverContent } from '@/components/ui/popover';
import { useOperationsFilters } from '@/features/operations/view-state/use-operations-filters';
import { getLocationLabel } from '@/lib/location/location-tree';
import { getTopLevelSites } from '@/lib/location/site-tree';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const ALL_LOCATIONS_VALUE = 'all';

interface OperationsLocationTreeSelectProps {
    locationTypeName: string;
}

export default function OperationsLocationTreeSelect({
    locationTypeName,
}: OperationsLocationTreeSelectProps) {
    const t = useTranslations('Operations');
    const tCommon = useTranslations('Common');
    const [{ selectedSiteIds }, setFilters] = useOperationsFilters();
    const [search, setSearch] = useState('');

    const { data: getUserPermissionsResult } = useGetUserPermissions();
    const accessibleSites = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.permissions.sites.canAccessSites
        : [];
    const topLevelSites = getTopLevelSites(accessibleSites);
    const isAllLocationsSelected =
        topLevelSites.length > 0 &&
        topLevelSites.every(site => selectedSiteIds.includes(site.siteId));

    function handleToggleAllLocations() {
        setFilters({
            selectedSiteIds: isAllLocationsSelected
                ? []
                : topLevelSites.map(site => site.siteId),
        });
    }

    const selectedLabelBySiteId = new Map(
        accessibleSites
            .filter(site => selectedSiteIds.includes(site.siteId))
            .map((site): [string, string] => [
                String(site.siteId),
                getLocationLabel(accessibleSites, site),
            ])
            .sort(([, firstLabel], [, secondLabel]) =>
                firstLabel.localeCompare(secondLabel),
            ),
    );

    function handleSelectedSitesChange(values: string[]) {
        setFilters({
            selectedSiteIds: values
                .filter(value => value !== ALL_LOCATIONS_VALUE)
                .map(Number),
        });
    }

    return (
        <MultiSelect
            values={
                isAllLocationsSelected
                    ? [ALL_LOCATIONS_VALUE]
                    : [...selectedLabelBySiteId.keys()]
            }
            onValuesChange={handleSelectedSitesChange}
        >
            <MultiSelectTrigger className="w-52">
                <MultiSelectValue
                    placeholder={t('selectDropdownPlaceholder', {
                        locationType: locationTypeName.toLocaleLowerCase(),
                    })}
                    getLabel={value => {
                        const label =
                            value === ALL_LOCATIONS_VALUE
                                ? t('allLocations')
                                : selectedLabelBySiteId.get(value);
                        return (
                            <span title={label} className="truncate">
                                {label}
                            </span>
                        );
                    }}
                />
            </MultiSelectTrigger>
            <PopoverContent className="min-w-(--radix-popover-trigger-width) p-0">
                <Command shouldFilter={false}>
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
                            {!search && (
                                <CommandItem
                                    value={ALL_LOCATIONS_VALUE}
                                    onSelect={handleToggleAllLocations}
                                >
                                    <Checkbox
                                        checked={isAllLocationsSelected}
                                        tabIndex={-1}
                                        className="pointer-events-none"
                                    />
                                    {t('allLocations')}
                                </CommandItem>
                            )}
                            {topLevelSites.map(site => (
                                <OperationsLocationTreeNode
                                    key={site.siteId}
                                    site={site}
                                    search={search}
                                />
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </MultiSelect>
    );
}
