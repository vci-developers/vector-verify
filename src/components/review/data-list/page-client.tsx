'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filters } from './filters';
import { ReviewTable } from './table';
import { LoadingSkeleton } from './loading-skeleton';
import { useDateRangeValues } from '@/lib/shared/utils/date-range';
import { useMonthlySummaryQuery } from '@/lib/review';
import type { DateRangeOption } from '@/lib/shared/utils/date-range';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ReviewDataListPageClient() {
  // Local state for filters
  const [dateRange, setDateRange] = useState<DateRangeOption>('all-time');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<{
    dateFrom?: string;
    dateTo?: string;
    districts?: string[];
  }>({});

  const { createdAfter, createdBefore } = useDateRangeValues(dateRange);

  // Convert ISO dates to YYYY-MM-DD format for API
  const dateFrom = createdAfter
    ? new Date(createdAfter).toISOString().split('T')[0]
    : undefined;
  const dateTo = createdBefore
    ? new Date(createdBefore).toISOString().split('T')[0]
    : undefined;

  // Fetch monthly summary data with applied filters
  const { data, isLoading, isFetching, error } = useMonthlySummaryQuery({
    dateFrom: appliedFilters.dateFrom,
    dateTo: appliedFilters.dateTo,
    districts: appliedFilters.districts,
  });

  const summaries = data?.monthlySummaries ?? [];
  const availableDistricts = data?.availableDistricts ?? [];

  const handleDateRangeChange = useCallback((newDateRange: DateRangeOption) => {
    setDateRange(newDateRange);
  }, []);

  const handleDistrictsChange = useCallback((districts: string[]) => {
    setSelectedDistricts(districts);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({
      dateFrom,
      dateTo,
      districts: selectedDistricts.length > 0 ? selectedDistricts : undefined,
    });
  }, [dateFrom, dateTo, selectedDistricts]);

  const handleReview = useCallback((district: string, month: string) => {
    // This will be handled by the Table component
    console.log('Review clicked for:', district, month);
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load review data. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold">Review Data</h1>
        <p className="text-muted-foreground">
          Review monthly surveillance data by district and time period.
        </p>
      </div>

      {/* Filters Container */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <Filters
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            districts={availableDistricts.map(d => ({
              value: d.name.toLowerCase().replace(/\s+/g, '-'),
              label: d.name,
            }))}
            selectedDistricts={selectedDistricts}
            onDistrictsChange={handleDistrictsChange}
            onApplyFilters={handleApplyFilters}
            disabled={isLoading || isFetching}
          />
        </CardContent>
      </Card>

      {/* Review Tasks Container */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Review Tasks ({summaries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {(isLoading || isFetching) && <LoadingSkeleton />}

          {/* Review Table */}
          {!isLoading && !isFetching && (
            <ReviewTable summaries={summaries} onReview={handleReview} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
