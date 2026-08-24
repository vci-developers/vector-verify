'use client';

import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import type { UserPermissions } from '@/api/user/validation/user-permissions-schema';
import PageShell from '@/components/layout/page-shell';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBanner from '@/components/ui/error-banner';
import EmptyBanner from '@/components/ui/empty-banner';
import {
    BookOpen,
    ClipboardCheck,
    LayoutDashboard,
    Microscope,
    PencilRuler,
    type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type DashboardCard = {
    titleKey: 'review' | 'operations' | 'annotate';
    descriptionKey:
        | 'reviewDescription'
        | 'operationsDescription'
        | 'annotateDescription';
    icon: LucideIcon;
    href: string;
    canAccess: (permissions: UserPermissions) => boolean;
};

const dashboardCards: DashboardCard[] = [
    {
        titleKey: 'review',
        descriptionKey: 'reviewDescription',
        icon: ClipboardCheck,
        href: '/review',
        canAccess: permissions => permissions.sites.writeSiteMetadata,
    },
    {
        titleKey: 'operations',
        descriptionKey: 'operationsDescription',
        icon: Microscope,
        href: '/operations',
        canAccess: permissions => permissions.sites.viewSiteMetadata,
    },
    {
        titleKey: 'annotate',
        descriptionKey: 'annotateDescription',
        icon: PencilRuler,
        href: '/annotate',
        canAccess: permissions =>
            permissions.annotations.viewAndWriteAnnotationTasks,
    },
];

export default function DashboardPageClient() {
    const tNavigation = useTranslations('Navigation');
    const tDashboard = useTranslations('Dashboard');
    const { data: getUserPermissionsResult, isPending } =
        useGetUserPermissions();

    const isLoading = isPending || !getUserPermissionsResult;
    const isError = !isLoading && !getUserPermissionsResult.ok;
    const accessibleCards = getUserPermissionsResult?.ok
        ? dashboardCards.filter(card =>
              card.canAccess(getUserPermissionsResult.data.permissions),
          )
        : [];

    return (
        <PageShell
            title={tDashboard('title')}
            description={tDashboard('description')}
            icon={LayoutDashboard}
        >
            <div className="space-y-8">
                {isLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2].map(skeletonIndex => (
                            <Card key={skeletonIndex}>
                                <CardHeader>
                                    <Skeleton height="lg" width="lg" />
                                    <Skeleton height="sm" width="full" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : isError ? (
                    <ErrorBanner message={tDashboard('couldNotLoad')} />
                ) : accessibleCards.length === 0 ? (
                    <EmptyBanner message={tDashboard('noAccess')} />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {accessibleCards.map(card => (
                            <Link key={card.href} href={card.href}>
                                <Card className="hover:bg-accent/40 h-full transition-colors">
                                    <CardHeader>
                                        <card.icon className="text-muted-foreground h-8 w-8" />
                                        <CardTitle>
                                            {tNavigation(card.titleKey)}
                                        </CardTitle>
                                        <CardDescription>
                                            {tDashboard(card.descriptionKey)}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="space-y-3">
                    <h2 className="text-muted-foreground text-sm font-medium">
                        {tDashboard('resources')}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Link href="/docs">
                            <Card className="hover:bg-accent/40 h-full transition-colors">
                                <CardHeader>
                                    <BookOpen className="text-muted-foreground h-8 w-8" />
                                    <CardTitle>
                                        {tDashboard('docsTitle')}
                                    </CardTitle>
                                    <CardDescription>
                                        {tDashboard('docsDescription')}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
