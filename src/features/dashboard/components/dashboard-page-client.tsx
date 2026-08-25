'use client';

import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import type { UserPermissions } from '@/api/user/validation/user-permissions-schema';
import PageShell from '@/components/layout/page-shell';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import ErrorBanner from '@/components/ui/error-banner';
import EmptyBanner from '@/components/ui/empty-banner';
import {
    BookOpen,
    ChevronRight,
    ClipboardCheck,
    LayoutDashboard,
    Microscope,
    PencilRuler,
    type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';

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
    const [pendingHref, setPendingHref] = useState<string | null>(null);

    const isLoading = isPending || !getUserPermissionsResult;
    const isError = !isLoading && !getUserPermissionsResult.ok;
    const userVisibleCards = getUserPermissionsResult?.ok
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
                                    <Skeleton
                                        rounded="lg"
                                        className="h-12 w-12"
                                    />
                                    <Skeleton height="sm" width="lg" />
                                    <Skeleton height="xs" width="full" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                ) : isError ? (
                    <ErrorBanner message={tDashboard('couldNotLoad')} />
                ) : userVisibleCards.length === 0 ? (
                    <EmptyBanner message={tDashboard('noAccess')} />
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {userVisibleCards.map(card => (
                            <Link
                                key={card.href}
                                href={card.href}
                                className="block"
                                onClick={() => setPendingHref(card.href)}
                            >
                                <Card className="group border-border/50 hover:border-primary/30 h-full transition-all duration-200 hover:shadow-lg">
                                    <CardHeader>
                                        <div className="bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-lg transition-colors">
                                            {pendingHref === card.href ? (
                                                <Spinner className="text-primary h-6 w-6" />
                                            ) : (
                                                <card.icon className="text-primary h-6 w-6" />
                                            )}
                                        </div>
                                        <CardTitle className="group-hover:text-primary flex items-center gap-1 text-base transition-colors">
                                            {tNavigation(card.titleKey)}
                                            <ChevronRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
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
                    <Link
                        href="/docs"
                        className="block"
                        onClick={() => setPendingHref('/docs')}
                    >
                        <Card className="group border-border/50 hover:border-primary/30 gap-0 py-0 transition-all duration-200 hover:shadow-md">
                            <CardContent className="flex items-center gap-3 p-4">
                                <div className="bg-muted group-hover:bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors">
                                    {pendingHref === '/docs' ? (
                                        <Spinner className="text-muted-foreground h-4 w-4" />
                                    ) : (
                                        <BookOpen className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="group-hover:text-primary text-sm font-medium transition-colors">
                                        {tDashboard('docsTitle')}
                                    </p>
                                    <p className="text-muted-foreground truncate text-xs">
                                        {tDashboard('docsDescription')}
                                    </p>
                                </div>
                                <ChevronRight className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-colors" />
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </PageShell>
    );
}
