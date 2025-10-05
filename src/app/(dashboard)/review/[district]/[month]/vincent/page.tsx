import { VincentReviewPageClient } from '@/components/review/vincent';

interface VincentReviewPageProps {
  params: {
    district: string;
    month: string;
  };
}

export default function VincentReviewPage({ params }: VincentReviewPageProps) {
  return (
    <VincentReviewPageClient district={params.district} month={params.month} />
  );
}
