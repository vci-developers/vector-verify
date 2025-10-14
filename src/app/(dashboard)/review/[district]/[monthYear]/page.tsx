import { ReviewDashboardPageClient } from '@/components/review/review-dashboard';

interface ReviewDashboardPageProps {
  params: Promise<{
    district: string;
    monthYear: string; // This will now be in format "2024-01"
  }>;
}

export default async function ReviewDashboardPage({
  params,
}: ReviewDashboardPageProps) {
  const { district, monthYear } = await params;

  return <ReviewDashboardPageClient district={district} monthYear={monthYear} />;
}
