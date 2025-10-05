'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VincentReviewPageClientProps {
  district: string;
  month: string;
}

export function VincentReviewPageClient({
  district,
  month,
}: VincentReviewPageClientProps) {
  const formattedMonth = decodeURIComponent(month);
  const formattedDistrict = decodeURIComponent(district);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-semibold">
          Vincent's Review Page
        </h1>
        <p className="text-muted-foreground mt-1">
          {formattedDistrict} - {formattedMonth}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Placeholder Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This is a placeholder page for Vincent's implementation. Vincent can
            work on his review interface here without merge conflicts.
          </p>
          <div className="bg-muted mt-4 rounded-lg p-4">
            <p className="text-muted-foreground text-sm">
              <strong>District:</strong> {formattedDistrict}
            </p>
            <p className="text-muted-foreground text-sm">
              <strong>Month:</strong> {formattedMonth}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
