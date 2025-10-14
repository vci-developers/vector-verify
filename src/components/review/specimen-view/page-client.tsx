'use client';

import React, { useMemo } from 'react';
import { SpecimenReviewAccordion } from './specimen-review-accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PAGE_SIZES, DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';
import { useUserPermissionsQuery } from '@/lib/user/client';
import { SpecimenAccordionLoadingSkeleton } from './loading-skeleton';

interface SpecimenViewPageClientProps {
  district: string;
  monthYear: string;
}

export function SpecimenViewPageClient({
  district,
  monthYear,
}: SpecimenViewPageClientProps) {
  const formattedDistrict = decodeURIComponent(district);
  const formattedMonthYear = decodeURIComponent(monthYear);

  const [pageSize, setPageSize] = React.useState<number>(DEFAULT_PAGE_SIZE);

  const [year, monthNum] = formattedMonthYear.split('-').map(Number);
  const startOfMonth = new Date(year, monthNum - 1, 1);
  const endOfMonth = new Date(year, monthNum, 0);

  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];

  // Get user permissions
  const { data: permissions, isLoading: isLoadingPermissions } = useUserPermissionsQuery();

  // Filter sites for this district
  const districtSites = useMemo(() => {
    if (!permissions?.sites?.canAccessSites) return [];
    
    return permissions.sites.canAccessSites
      .filter(site => site.district === formattedDistrict);
  }, [permissions?.sites?.canAccessSites, formattedDistrict]);

  const siteIds = useMemo(() => districtSites.map(site => site.siteId), [districtSites]);
  const houseNumbers = useMemo(() => 
    districtSites.map(site => site.houseNumber ?? `Site ${site.siteId}`),
    [districtSites]
  );

  // Format month name for display
  const monthName = new Date(year, monthNum - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  function handleRowsPerPageChange(value: string) {
    setPageSize(Number(value));
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {formattedDistrict}
          <span className="ml-3 text-2xl font-normal text-muted-foreground">
            {monthName}
          </span>
        </h1>

        {districtSites.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Items per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={handleRowsPerPageChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {isLoadingPermissions ? (
        <SpecimenAccordionLoadingSkeleton />
      ) : districtSites.length === 0 ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No sites in this district
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              There are no registered sites for {formattedDistrict}
            </p>
          </div>
        </div>
      ) : (
        <SpecimenReviewAccordion 
          siteIds={siteIds}
          houseNumbers={houseNumbers}
          district={formattedDistrict}
          startDate={startDate}
          endDate={endDate}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}
