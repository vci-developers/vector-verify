'use client';

import { DistrictReviewAccordion } from './district-review-accordion';
import { useSpecimensQuery } from '@/lib/review/client/hooks/use-specimens';


interface DistrictReviewPageClientProps {
  reviewDistrict: string; // Format: "DistrictName2024-09"
}

export function DistrictReviewPageClient({ reviewDistrict }: DistrictReviewPageClientProps) {
  // Extract district and month from the combined string
  const match = reviewDistrict.match(/^(.+?)(\d{4}-\d{2})$/);
  
  if (!match) {
    return <div className="p-4 text-destructive">Invalid URL format</div>;
  }

  const district = decodeURIComponent(match[1]);
  const month = match[2]; // YYYY-MM format

  // Parse month to get start and end dates in YYYY-MM-DD format
  const [year, monthNum] = month.split('-').map(Number);
  const startOfMonth = new Date(year, monthNum - 1, 1);
  const endOfMonth = new Date(year, monthNum, 0);

  const dateFrom = startOfMonth.toISOString().split('T')[0]; // YYYY-MM-DD
  const dateTo = endOfMonth.toISOString().split('T')[0]; // YYYY-MM-DD

  const { data, isLoading, error } = useSpecimensQuery({
    district,
    dateFrom,
    dateTo,
  });

  const specimens = data?.items ?? [];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {district}
          <span className="ml-3 text-2xl font-normal text-muted-foreground">
            {formatMonth(month)}
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
        <DistrictReviewAccordion specimens={specimens} />
      )}
    </div>
  );
}

function formatMonth(monthStr: string) {
  const [year, monthNum] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}