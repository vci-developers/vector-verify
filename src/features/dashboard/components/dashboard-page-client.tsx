'use client';

import { useUserPermissionsQuery } from '@/features/user';
import {
  canViewAndWriteAnnotationTasks,
  canViewSites,
} from '@/features/user/utils/permissions';
import { useRouter } from 'next/navigation';
import { LuPen } from 'react-icons/lu';
import { Search } from 'lucide-react';
import { LandingPageCard } from './landing-page-card';
import { NoAccessView } from './no-access-view';
import { LogoutButton } from './logout-button';

export function DashboardPageClient() {
  const router = useRouter();
  const { data: permissions, isLoading } = useUserPermissionsQuery();

  const canAnnotate =
    permissions && canViewAndWriteAnnotationTasks(permissions);
  const canReview = permissions && canViewSites(permissions);
  const hasAnyAccess = canAnnotate || canReview;

  if (!hasAnyAccess) {
    return <NoAccessView />;
  }

  return (
    <div className="relative min-h-screen bg-white">
      <LogoutButton />
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 py-16">
        <div className="mb-16 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-[#86EFAC] to-[#22C55E] bg-clip-text text-5xl font-bold text-transparent">
            VectorVerify
          </h1>
          <p className="text-2xl text-black">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
        <div className="w-full max-w-3xl space-y-6">
          {canAnnotate && (
            <LandingPageCard
              icon={<LuPen className="h-8 w-8 text-[#166534]" />}
              title="Start Annotating"
              description={[
                'Review and label your assigned tasks.',
                'Access your queue and continue where you left off.',
              ]}
              onClick={() => router.push('/annotate')}
              isLoading={isLoading}
            />
          )}
          {canReview && (
            <LandingPageCard
              icon={<Search className="h-8 w-8 text-[#166534]" />}
              title="Review Data"
              description={[
                'Review and validate completed surveillance.',
                'Browse and verify surveillance documentation quality and accuracy.',
              ]}
              onClick={() => router.push('/review')}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
