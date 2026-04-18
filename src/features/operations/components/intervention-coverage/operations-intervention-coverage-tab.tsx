import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BedDouble, House, Shield, Users } from 'lucide-react';

const IRS_COVERAGE = {
    percent: 35,
    title: 'Indoor Residual Spraying (IRS) Coverage',
    description: 'Percentage of surveyed households with IRS in the past 12 months',
    guidance: 'Values below 80% indicate a need for IRS campaign intensification.',
};

const LLIN_HOUSEHOLD_STATS = [
    { label: 'Total LLINs', value: '638' },
    { label: 'Avg LLINs per House', value: '1.00' },
    { label: 'Houses with LLINs', value: '460' },
] as const;

const LLIN_USAGE_STATS = [
    { label: 'Number of People', value: '1,248' },
    { label: 'Sleeping Under Nets', value: '732' },
    { label: 'Not Sleeping Under Nets', value: '516' },
] as const;

interface MetricRowProps {
    label: string;
    value: string;
}

function MetricRow({ label, value }: MetricRowProps) {
    return (
        <div className="bg-background/95 flex items-center justify-between rounded-2xl border border-white/70 px-5 py-4 shadow-sm">
            <span className="text-muted-foreground text-sm font-medium md:text-base">
                {label}
            </span>
            <span className="text-xl font-semibold tracking-tight md:text-2xl">
                {value}
            </span>
        </div>
    );
}

export default function OperationsInterventionCoverageTab() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight">
                    Intervention Coverage
                </h2>
                <p className="text-muted-foreground max-w-4xl text-base md:text-lg">
                    Track uptake and household reach of key malaria prevention
                    interventions to identify coverage gaps and follow-up needs.
                </p>
            </div>

            <div className="space-y-4">
                <Card className="border-sky-200/80 bg-sky-50/70 py-0 shadow-sm">
                    <CardHeader className="gap-5 px-8 pt-8 pb-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-3">
                                <div className="text-primary flex items-center gap-3">
                                    <Shield className="h-7 w-7" />
                                    <CardTitle className="text-2xl leading-tight md:text-3xl">
                                        {IRS_COVERAGE.title}
                                    </CardTitle>
                                </div>
                                <CardDescription className="max-w-2xl text-base text-sky-700 md:text-lg">
                                    {IRS_COVERAGE.description}
                                </CardDescription>
                            </div>
                            <div className="text-primary text-5xl font-semibold tracking-tight md:text-6xl">
                                {IRS_COVERAGE.percent.toFixed(1)}%
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 px-8 pb-8">
                        <div className="space-y-2">
                            <Progress
                                value={IRS_COVERAGE.percent}
                                className="bg-primary/15 h-7 rounded-full"
                            />
                            <div className="text-primary flex justify-end text-sm font-semibold">
                                {IRS_COVERAGE.percent.toFixed(1)}%
                            </div>
                        </div>

                        <p className="text-sm font-medium text-sky-700 md:text-base">
                            {IRS_COVERAGE.guidance}
                        </p>
                    </CardContent>
                </Card>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card className="border-violet-200/80 bg-violet-50/80 py-0 shadow-sm">
                        <CardHeader className="gap-3 px-8 pt-8 pb-4">
                            <div className="text-primary flex items-center gap-3">
                                <House className="h-6 w-6" />
                                <CardTitle className="text-2xl leading-tight md:text-3xl">
                                    LLIN Household Statistics
                                </CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4 px-8 pb-8">
                            {LLIN_HOUSEHOLD_STATS.map(stat => (
                                <MetricRow
                                    key={stat.label}
                                    label={stat.label}
                                    value={stat.value}
                                />
                            ))}

                            <p className="text-sm font-medium text-violet-700 md:text-base">
                                Universal coverage target: 1 LLIN per 2 people
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-amber-200/80 bg-amber-50/80 py-0 shadow-sm">
                        <CardHeader className="gap-3 px-8 pt-8 pb-4">
                            <div className="text-primary flex items-center gap-3">
                                <Users className="h-6 w-6" />
                                <CardTitle className="text-2xl leading-tight md:text-3xl">
                                    LLIN Utilization Snapshot
                                </CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4 px-8 pb-8">
                            {LLIN_USAGE_STATS.map(stat => (
                                <MetricRow
                                    key={stat.label}
                                    label={stat.label}
                                    value={stat.value}
                                />
                            ))}

                            <div className="text-muted-foreground flex items-center gap-2 text-sm md:text-base">
                                <BedDouble className="h-4 w-4" />
                                <span>
                                    Placeholder totals reflect people surveyed
                                    in households with LLIN utilization
                                    responses.
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
