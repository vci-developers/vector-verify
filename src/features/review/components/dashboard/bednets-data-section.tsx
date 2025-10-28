'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import type { DashboardMetrics } from '@/features/review/types/dashboard';

interface BednetsDataSectionProps {
  data: DashboardMetrics['entomologicalSummary'];
}

export function BednetsDataSection({ data }: BednetsDataSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Bednets Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Bednets */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">Total Bednets</h3>
          <div className="text-3xl font-bold text-blue-600">
            {data.totalLlins.toLocaleString()}
          </div>
        </div>

        {/* Number of people who slept under bednets */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">
            Number of people who slept under bednets
          </h3>
          <div className="text-3xl font-bold text-green-600">
            {data.totalPeopleSleptUnderLlin.toLocaleString()}
          </div>
        </div>

        {/* Number of bednets per person */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">
            Number of bednets per person
          </h3>
          <div className="text-3xl font-bold text-purple-600">
            {data.llinsPerPerson.toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
