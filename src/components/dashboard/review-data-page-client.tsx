'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ReviewDataPageClient() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page is under development. It will display a list of data items for review, similar to the annotation tasks list.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
