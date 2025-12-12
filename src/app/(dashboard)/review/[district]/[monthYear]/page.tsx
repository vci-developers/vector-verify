import { ReviewDashboardPageClient } from '@/features/review';

interface ReviewDashboardPageProps {
  params: Promise<{
    district: string;
    monthYear: string;
  }>;
}

export default async function ReviewDashboardPage({
  params,
}: ReviewDashboardPageProps) {
  const { district, monthYear } = await params;

  return (
    <ReviewDashboardPageClient district={district} monthYear={monthYear} />
  );
}
