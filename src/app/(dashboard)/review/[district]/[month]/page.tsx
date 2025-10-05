import { ReviewAssignmentPageClient } from '@/components/review/review-assignment';

interface ReviewAssignmentPageProps {
  params: {
    district: string;
    month: string;
  };
}

export default function ReviewAssignmentPage({
  params,
}: ReviewAssignmentPageProps) {
  return (
    <ReviewAssignmentPageClient
      district={params.district}
      month={params.month}
    />
  );
}
