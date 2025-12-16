'use client';

import Image from 'next/image';
import { InfoCard, SectionHeader } from './shared';
import type { DashboardMetrics } from '@/features/review/types/model';

interface BednetsDataSectionProps {
  data: DashboardMetrics['entomologicalSummary'];
}

export function BednetsDataSection({ data }: BednetsDataSectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Bednets Data" showBreakline={false} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <InfoCard
          icon={
            <Image
              src="/assets/auth/icons/House.png"
              alt="House"
              width={20}
              height={20}
              className="object-contain"
            />
          }
          title="Total Bednets"
          value={data.totalLlins}
          tooltipContent="This represents the total count of Long-Lasting Insecticidal Nets (LLINs) across all surveyed houses. This metric helps assess the availability of protective bednets in the community and is used to evaluate coverage of vector control interventions."
        />
        <InfoCard
          icon={
            <Image
              src="/assets/auth/icons/People.png"
              alt="People"
              width={20}
              height={20}
              className="object-contain"
            />
          }
          title="No. of People who Slept under Bednets"
          value={data.totalPeopleSleptUnderLlin}
          tooltipContent="This count includes all individuals who reported sleeping under a bednet during the survey period. It measures actual usage of bednets rather than just availability, which is critical for understanding the real-world effectiveness of bednet distribution programs."
        />
        <InfoCard
          icon={
            <Image
              src="/assets/auth/icons/Mosquito.png"
              alt="Mosquito"
              width={24}
              height={24}
              className="object-contain"
            />
          }
          title="No. of Bednets per Person"
          value={data.llinsPerPerson.toFixed(2)}
          tooltipContent="Number of bednets per person is averaged across all houses. This ratio divides the total number of bednets by the total number of people in surveyed houses. It provides insight into bednet availability and helps determine if there are sufficient nets to protect the population. The World Health Organization recommends aiming for universal coverage."
        />
      </div>
    </div>
  );
}
