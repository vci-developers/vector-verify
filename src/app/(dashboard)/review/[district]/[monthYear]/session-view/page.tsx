import { SessionsViewPageClient } from '@/features/review/components/session-view/page-client';

interface SessionsViewPageProps {
  params: {
    district: string;
    monthYear: string;
  };
}

export default async function SpecimenViewPage({
  params,
}: SessionsViewPageProps) {
  const { district, monthYear } = await params;

  return <SessionsViewPageClient district={district} monthYear={monthYear} />;
}
