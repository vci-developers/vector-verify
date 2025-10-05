'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ReviewAssignmentPageClientProps {
  district: string;
  month: string;
}

export function ReviewAssignmentPageClient({
  district,
  month,
}: ReviewAssignmentPageClientProps) {
  const formattedMonth = decodeURIComponent(month);
  const formattedDistrict = decodeURIComponent(district);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-semibold">
          Review Data - {formattedDistrict}
        </h1>
        <p className="text-muted-foreground mt-1">{formattedMonth}</p>
      </div>

      <div className="grid max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Vincent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Access Vincent's review interface for this district and month.
            </p>
            <Button asChild className="w-full">
              <Link href={`/review/${district}/${month}/vincent`}>
                Go to Vincent's Page
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Aryaman</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Access Aryaman's review interface for this district and month.
            </p>
            <Button asChild className="w-full">
              <Link href={`/review/${district}/${month}/aryaman`}>
                Go to Aryaman's Page
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
