'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import type { DashboardMetrics } from '@/features/review/types/dashboard';

interface SiteInformationSectionProps {
  data: DashboardMetrics['siteInformation'];
}

export function SiteInformationSection({ data }: SiteInformationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Site Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Number of Houses used for collection */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">
            Number of Houses used for collection
          </h3>
          <div className="text-3xl font-bold text-blue-600">
            {data.housesUsedForCollection.toLocaleString()}
          </div>
        </div>

        {/* Number of people in all houses inspected */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">
            Number of people in all houses inspected
          </h3>
          <div className="text-3xl font-bold text-green-600">
            {data.peopleInAllHousesInspected.toLocaleString()}
          </div>
        </div>

        {/* Vector Density - This would need to be calculated from specimens data */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">Vector Density</h3>
          <div className="text-3xl font-bold text-purple-600">
            {/* This would be calculated as: total specimens / houses used */}
            {data.housesUsedForCollection > 0
              ? (
                  data.peopleInAllHousesInspected / data.housesUsedForCollection
                ).toFixed(2)
              : '0.00'}
          </div>
          <p className="text-xs text-gray-500">People per house</p>
        </div>
      </CardContent>
    </Card>
  );
}
