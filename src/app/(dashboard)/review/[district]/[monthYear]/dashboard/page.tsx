import { DashboardPageClient } from '@/features/review/components/dashboard';

interface DashboardPageProps {
  params: Promise<{
    district: string;
    monthYear: string;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { district, monthYear } = await params;

  return (
    <DashboardPageClient
      district={decodeURIComponent(district)}
      monthYear={decodeURIComponent(monthYear)}
    />
  );
}
