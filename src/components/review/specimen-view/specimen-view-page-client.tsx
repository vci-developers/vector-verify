'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpecimenViewPageClientProps {
  district: string;
  month: string; // This will now be in format "2024-01"
}

export function SpecimenViewPageClient({
  district,
  month,
}: SpecimenViewPageClientProps) {
  const formattedMonth = decodeURIComponent(month);
  const formattedDistrict = decodeURIComponent(district);

  // Parse the month string (format: "2024-01") to display format
  const [year, monthNum] = formattedMonth.split('-');
  const monthName = new Date(
    parseInt(year),
    parseInt(monthNum) - 1,
    1,
  ).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-semibold">
          Specimen View
        </h1>
        <p className="text-muted-foreground mt-1">
          {formattedDistrict} - {monthName}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Specimen Review Interface</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is the specimen review interface for analyzing and reviewing
            specimen data.
          </p>
          <div className="bg-muted mt-4 rounded-lg p-4">
            <p className="text-muted-foreground text-sm">
              <strong>District:</strong> {formattedDistrict}
            </p>
            <p className="text-muted-foreground text-sm">
              <strong>Month:</strong> {monthName}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
