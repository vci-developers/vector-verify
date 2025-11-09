import { ReviewDataQualityPageClient } from '@/features/review';

interface ReviewDataQualityPageProps {
  params: Promise<{
    district: string;
    monthYear: string;
  }>;
}

export default async function ReviewDataQualityPage({
  params,
}: ReviewDataQualityPageProps) {
  const { district, monthYear } = await params;

  return (
    <ReviewDataQualityPageClient district={district} monthYear={monthYear} />
  );
}
