'use client';

import { useMemo, useState } from 'react';
import { SpecimenReviewAccordion } from './specimen-review-accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { PAGE_SIZES, DEFAULT_PAGE_SIZE } from '@/shared/entities/pagination';
import { useUserPermissionsQuery } from '@/features/user';
import { SpecimenAccordionLoadingSkeleton } from './loading-skeleton';
import { SpecimenFilters, SpecimenFiltersBar } from './specimen-filters';
import { getMonthDateRange } from '@/features/review/utils/master-table-view';

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

  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<SpecimenFilters>({
    species: null,
    sex: null,
    abdomenStatus: null,
  });

  const dateRange = getMonthDateRange(formattedMonthYear);
  const startDate = dateRange?.startDate;
  const endDate = dateRange?.endDate;

  const [year, monthNum] = formattedMonthYear.split('-').map(Number);

  const { data: permissions, isLoading: isLoadingPermissions } =
    useUserPermissionsQuery();

  const districtSites = useMemo(() => {
    if (!permissions?.sites?.canAccessSites) return [];

    return permissions.sites.canAccessSites.filter(
      site => site.district === formattedDistrict,
    );
  }, [permissions?.sites?.canAccessSites, formattedDistrict]);

  const siteIds = useMemo(
    () => districtSites.map(site => site.siteId),
    [districtSites],
  );
  const houseNumbers = useMemo(
    () => districtSites.map(site => site.houseNumber ?? `Site ${site.siteId}`),
    [districtSites],
  );
  const villageNames = useMemo(
    () => districtSites.map(site => site.villageName ?? null),
    [districtSites],
  );

  const monthName = new Date(year, monthNum - 1, 1).toLocaleDateString(
    'en-US',
    {
      month: 'long',
      year: 'numeric',
    },
  );

  function handleRowsPerPageChange(value: string) {
    setPageSize(Number(value));
  }

  function handleFiltersChange(newFilters: SpecimenFilters) {
    setFilters(newFilters);
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <header className="flex items-end justify-between gap-4 border-b pb-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Specimen View
          </p>
          <h1 className="text-3xl font-semibold">{formattedDistrict}</h1>
          <p className="text-muted-foreground text-sm">{monthName}</p>
        </div>
        <div className="text-muted-foreground text-sm">
          <span className="text-2xl font-semibold">
            {districtSites.length.toLocaleString()}
          </span>{' '}
          house{districtSites.length === 1 ? '' : 's'} in view
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-foreground text-2xl font-semibold">
              Specimen Counts
            </h2>
            <p className="text-muted-foreground text-sm">
              Review specimens for the selected district and month.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SpecimenFiltersBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              disabled={isLoadingPermissions || districtSites.length === 0}
            />

            {districtSites.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground whitespace-nowrap text-sm">
                  Per page:
                </span>
                <Select
                  value={String(pageSize)}
                  onValueChange={handleRowsPerPageChange}
                >
                  <SelectTrigger className="w-18">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZES.map(size => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {isLoadingPermissions ? (
            <SpecimenAccordionLoadingSkeleton />
          ) : districtSites.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <p className="text-muted-foreground text-lg font-medium">
                  No sites in this district
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  There are no registered sites for {formattedDistrict}
                </p>
              </div>
            </div>
          ) : (
            <SpecimenReviewAccordion
              siteIds={siteIds}
              houseNumbers={houseNumbers}
              villageNames={villageNames}
              district={formattedDistrict}
              startDate={startDate}
              endDate={endDate}
              pageSize={pageSize}
              filters={filters}
            />
          )}
        </div>
      </section>
    </div>
  );
}
