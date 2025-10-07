import { DistrictReviewPageClient } from '@/components/review/district-review/page-client';

export default async function Page({
  params,
}: {
  params: Promise<{ reviewDistrict: string }>;
}) {
  const { reviewDistrict } = await params;

  return <DistrictReviewPageClient reviewDistrict={reviewDistrict} />;
}