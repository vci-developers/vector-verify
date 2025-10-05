import { ReviewDashboardPageClient } from '@/components/review/review-assignment';

interface ReviewDashboardPageProps {
  params: {
    district: string;
    month: string; // This will now be in format "2024-01"
  };
}

export default function ReviewDashboardPage({
  params,
}: ReviewDashboardPageProps) {
  return (
    <ReviewDashboardPageClient
      district={params.district}
      month={params.month}
    />
  );
}
