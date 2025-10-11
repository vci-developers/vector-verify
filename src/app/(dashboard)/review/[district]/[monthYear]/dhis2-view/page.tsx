import { Dhis2ViewPageClient } from '@/components/review/dhis2-view';

interface Dhis2ViewPageProps {
  params: {
    district: string;
    month: string; // This will now be in format "2024-01"
  };
}

export default async function Dhis2ViewPage({ params }: Dhis2ViewPageProps) {
  const { district, month } = await params;

  return <Dhis2ViewPageClient district={district} month={month} />;
}
