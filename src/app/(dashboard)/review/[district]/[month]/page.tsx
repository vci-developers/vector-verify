import { ReviewDashboardPageClient } from '@/components/review/review-dashboard';

interface ReviewDashboardPageProps {
  params: {
    district: string;
    month: string; // This will now be in format "2024-01"
  };
}

export default async function ReviewDashboardPage({
  params,
}: ReviewDashboardPageProps) {
  const { district, month } = await params;

  return <ReviewDashboardPageClient district={district} month={month} />;
}
