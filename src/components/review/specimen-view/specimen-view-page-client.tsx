'use client';

import React from 'react';
import { SpecimenReviewAccordion } from './specimen-review-accordion';
import { useSpecimensQuery } from '@/lib/review/client/hooks/use-specimens';

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

  // Parse month to get start and end dates in YYYY-MM-DD format
  const [year, monthNum] = formattedMonth.split('-').map(Number);
  const startOfMonth = new Date(year, monthNum - 1, 1);
  const endOfMonth = new Date(year, monthNum, 0);
  
  const dateFrom = startOfMonth.toISOString().split('T')[0]; // YYYY-MM-DD
  const dateTo = endOfMonth.toISOString().split('T')[0]; // YYYY-MM-DD

  // Fetch specimens for the district with date filters
  const { data, isLoading, error } = useSpecimensQuery({
    district: formattedDistrict,
    dateFrom,
    dateTo,
  });

  const specimens = data?.items ?? [];

  // Format month name for display
  const monthName = new Date(year, monthNum - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {formattedDistrict}
          <span className="ml-3 text-2xl font-normal text-muted-foreground">
            {monthName}
          </span>
        </h1>
      </div>

      {isLoading && (
        <div className="p-4 text-muted-foreground">Loading specimens...</div>
      )}

      {error && (
        <div className="p-4 text-destructive">Error loading specimens</div>
      )}

      {!isLoading && !error && (
        <SpecimenReviewAccordion specimens={specimens} />
      )}
    </div>
  );
}
