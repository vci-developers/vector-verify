'use client';

import { Home, Users, Bug } from 'lucide-react';
import { InfoCard, SectionHeader } from './shared';
import type { DashboardMetrics } from '@/features/review/types/model';

interface SiteInformationSectionProps {
  data: DashboardMetrics['siteInformation'];
  vectorDensity: number;
}

export function SiteInformationSection({
  data,
  vectorDensity,
}: SiteInformationSectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Site Information" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <InfoCard
          icon={<Home className="h-8 w-8" />}
          title="No. of Houses Used For Collection"
          value={data.housesUsedForCollection}
        />
        <InfoCard
          icon={<Users className="h-8 w-8" />}
          title="No. of People in All Houses Inspected"
          value={data.peopleInAllHousesInspected}
        />
        <InfoCard
          icon={<Bug className="h-8 w-8" />}
          title="Vector Density"
          value={vectorDensity}
        />
      </div>
    </div>
  );
}
