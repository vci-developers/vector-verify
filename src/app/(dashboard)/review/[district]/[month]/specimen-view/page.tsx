import { SpecimenViewPageClient } from '@/components/review/specimen-view';

interface SpecimenViewPageProps {
  params: {
    district: string;
    month: string; // This will now be in format "2024-01"
  };
}

export default function SpecimenViewPage({ params }: SpecimenViewPageProps) {
  return (
    <SpecimenViewPageClient district={params.district} month={params.month} />
  );
}
