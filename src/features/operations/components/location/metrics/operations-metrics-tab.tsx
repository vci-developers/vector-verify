'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bug, Home, Moon, Users } from 'lucide-react';
import OperationsMetricsStatCard from './operations-metrics-stat-card';

const SITE_INFO_CARDS = [
    { label: 'No. of Houses Used For Collection', value: '—', icon: Home },
    { label: 'No. of People in All Houses Inspected', value: '—', icon: Users },
    { label: 'Vector Density', value: '—', icon: Bug },
] as const;

const BEDNETS_CARDS = [
    { label: 'Total Bednets', value: '—', icon: Home },
    { label: 'No. of People who Slept under Bednets', value: '—', icon: Users },
    { label: 'No. of Bednets per Person', value: '—', icon: Bug },
] as const;

function SectionHeader({ title }: { title: string }) {
    return <h3 className="text-base font-semibold text-teal-600">{title}</h3>;
}

function DonutSkeleton() {
    return (
        <div className="relative flex h-36 w-36 items-center justify-center">
            <Skeleton className="h-36 w-36 rounded-full" />
            <div className="bg-card absolute h-16 w-16 rounded-full" />
        </div>
    );
}

export default function OperationsMetricsTab() {
    return (
        <div className="mt-4 space-y-8">
            <div className="space-y-3">
                <SectionHeader title="Site Information" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {SITE_INFO_CARDS.map(card => (
                        <OperationsMetricsStatCard
                            key={card.label}
                            label={card.label}
                            value={card.value}
                            icon={card.icon}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <SectionHeader title="Entomological Summary" />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">
                                Anopheles Sex
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center py-4">
                            <DonutSkeleton />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">
                                Abdomen Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center py-4">
                            <DonutSkeleton />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">
                                Species Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-52 w-full" />
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <OperationsMetricsStatCard
                            label="No. of LLINs"
                            value="—"
                            icon={Bug}
                        />
                        <OperationsMetricsStatCard
                            label="Fed Mosquitoes to People who Slept Ratio"
                            value="—"
                            icon={Moon}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <SectionHeader title="Bednets Data" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {BEDNETS_CARDS.map(card => (
                        <OperationsMetricsStatCard
                            key={card.label}
                            label={card.label}
                            value={card.value}
                            icon={card.icon}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
