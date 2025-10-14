import { MasterTableViewPageClient } from '@/components/review/master-table-view/page-client';

interface MasterTableViewPageProps {
  params: Promise<{
    district: string;
    monthYear: string;
  }>;
}

export default async function MasterTableViewPage({
  params,
}: MasterTableViewPageProps) {
  const { district, monthYear } = await params;

  return (
    <MasterTableViewPageClient district={district} monthYear={monthYear} />
  );
}

