import { AryamanReviewPageClient } from '@/components/review/aryaman';

interface AryamanReviewPageProps {
  params: {
    district: string;
    month: string;
  };
}

export default function AryamanReviewPage({ params }: AryamanReviewPageProps) {
  return (
    <AryamanReviewPageClient district={params.district} month={params.month} />
  );
}
