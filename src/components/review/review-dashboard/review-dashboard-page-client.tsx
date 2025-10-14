'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ReviewDashboardPageClientProps {
  district: string;
  monthYear: string; // This will now be in format "2024-01"
}

export function ReviewDashboardPageClient({
  district,
  monthYear,
}: ReviewDashboardPageClientProps) {
  const formattedMonth = decodeURIComponent(monthYear);
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
      <div className="mb-8 text-center">
        <h1 className="text-foreground text-2xl font-semibold">
          Review Dashboard - {formattedDistrict}
        </h1>
        <p className="text-muted-foreground mt-1">{monthName}</p>
      </div>

      <div className="flex justify-center">
        <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">DHIS2 View</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Access the DHIS2 review interface for this district and month.
              </p>
              <Button asChild className="w-full">
                <Link href={`/review/${district}/${monthYear}/dhis2-view`}>
                  Go to DHIS2 View
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Specimen View</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Access the specimen review interface for this district and
                month.
              </p>
              <Button asChild className="w-full">
                <Link href={`/review/${district}/${monthYear}/specimen-view`}>
                  Go to Specimen View
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
