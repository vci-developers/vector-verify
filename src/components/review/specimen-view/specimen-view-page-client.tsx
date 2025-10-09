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
import { PAGE_SIZES } from '@/lib/shared/constants';
import { useUserPermissionsQuery } from '@/lib/user/client';

interface SpecimenViewPageClientProps {
  district: string;
  month: string;
}

export function SpecimenViewPageClient({
  district,
  month,
}: SpecimenViewPageClientProps) {
  const formattedDistrict = decodeURIComponent(district);
  const formattedMonth = decodeURIComponent(month);

  const [pageSize, setPageSize] = React.useState(20);

  const [year, monthNum] = formattedMonth.split('-').map(Number);
  const startOfMonth = new Date(year, monthNum - 1, 1);
  const endOfMonth = new Date(year, monthNum, 0);

  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];

  // Get user permissions to get siteIds
  const { data: permissions, isLoading: isLoadingPermissions } = useUserPermissionsQuery();

  // Extract siteIds from permissions for this district
  const siteIds = useMemo(() => {
    if (!permissions?.sites?.canAccessSites) return [];
    
    return permissions.sites.canAccessSites
      .filter(site => site.district === formattedDistrict)
      .map(site => site.id);
  }, [permissions?.sites?.canAccessSites, formattedDistrict]);


    const houseNumbers = useMemo(() => {
    if (!permissions?.sites?.canAccessSites) return [];
    
    return permissions.sites.canAccessSites
      .filter(site => site.district === formattedDistrict)
      .map(site => site.houseNumber)
      .filter((houseNumber): houseNumber is string => houseNumber !== null);
  }, [permissions?.sites?.canAccessSites, formattedDistrict]);

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
      </div>

      {isLoadingPermissions && (
        <div className="p-4 text-muted-foreground">Loading sites...</div>
      )}

      {!isLoadingPermissions && (
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
