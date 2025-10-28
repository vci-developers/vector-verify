'use client';

import { Home, Users, Bug } from 'lucide-react';
import { InfoCard, SectionHeader } from './shared';
import type { DashboardMetrics } from '@/features/review/types/dashboard';

interface BednetsDataSectionProps {
  data: DashboardMetrics['entomologicalSummary'];
}

export function BednetsDataSection({ data }: BednetsDataSectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Bednets Data" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <InfoCard
          icon={<Home className="h-8 w-8" />}
          title="Total Bednets"
          value={data.totalLlins}
        />
        <InfoCard
          icon={<Users className="h-8 w-8" />}
          title="No. of People who Slept under Bednets"
          value={data.totalPeopleSleptUnderLlin}
        />
        <InfoCard
          icon={<Bug className="h-8 w-8" />}
          title="No. of Bednets per Person"
          value={data.llinsPerPerson.toFixed(2)}
        />
      </div>
    </div>
  );
}
