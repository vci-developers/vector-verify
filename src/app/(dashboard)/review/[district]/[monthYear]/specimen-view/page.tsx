import { SpecimenViewPageClient } from '@/features/review';

interface SpecimenViewPageProps {
  params: {
    district: string;
    monthYear: string;
  };
}

export default async function SpecimenViewPage({
  params,
}: SpecimenViewPageProps) {
  const { district, monthYear } = await params;

  return <SpecimenViewPageClient district={district} monthYear={monthYear} />;
}
