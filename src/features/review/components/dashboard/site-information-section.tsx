'use client';

import Image from 'next/image';
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
      <SectionHeader title="Site Information" showBreakline={false} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <InfoCard
          icon={<Image src="/assets/auth/icons/House.png" alt="House" width={20} height={20} className="object-contain" />}
          title="No. of Houses Used For Collection"
          value={data.housesUsedForCollection}
          tooltipContent="This metric represents the total number of residential structures where mosquito collection activities were conducted during the survey period. It indicates the scope and coverage of the entomological surveillance effort in the area."
        />
        <InfoCard
          icon={<Image src="/assets/auth/icons/People.png" alt="People" width={20} height={20} className="object-contain" />}
          title="No. of People in All Houses Inspected"
          value={data.peopleInAllHousesInspected}
          tooltipContent="This count includes all individuals residing in the houses that were inspected during the survey. This metric helps assess the population coverage of the surveillance and provides context for calculating per-person metrics such as vector density and bednet usage rates."
        />
        <InfoCard
          icon={<Image src="/assets/auth/icons/Mosquito.png" alt="Mosquito" width={24} height={24} className="object-contain" />}
          title="Vector Density"
          value={vectorDensity}
          tooltipContent="Vector density is calculated as the average number of mosquitoes collected per house. This metric is crucial for assessing the intensity of vector populations and understanding the risk of disease transmission. Higher densities may indicate increased transmission risk."
        />
      </div>
    </div>
  );
}
