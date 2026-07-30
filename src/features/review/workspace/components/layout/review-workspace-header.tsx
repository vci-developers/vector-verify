'use client';

import { cn } from '@/utils/cn';
import { Check, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';

interface ReviewWorkspaceHeaderProps {
    stepLabels: readonly string[];
    currentStepIndex: number;
    siteName?: string;
}

export default function ReviewWorkspaceHeader({
    stepLabels,
    currentStepIndex,
    siteName,
}: ReviewWorkspaceHeaderProps) {
    const t = useTranslations('ReviewWorkspace');
    const searchParams = useSearchParams();
    const listQueryString = searchParams.get('back');
    const backHref = listQueryString ? `/review?${listQueryString}` : '/review';

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Link
                    href={backHref}
                    className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm transition-colors"
                >
                    <ChevronLeft className="h-4 w-3" />
                    {t('backToSites')}
                </Link>
                {siteName && (
                    <Fragment>
                        <span className="text-muted-foreground text-sm">|</span>
                        <span className="text-foreground text-sm font-medium">
                            {siteName}
                        </span>
                    </Fragment>
                )}
            </div>

            <div className="flex items-center justify-center">
                {stepLabels.map((label, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = index < currentStepIndex;
                    const isActive = index === currentStepIndex;
                    const isLastStep = index === stepLabels.length - 1;

                    return (
                        <Fragment key={label}>
                            <div className="flex flex-col items-center gap-1">
                                <div
                                    className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium',
                                        isCompleted &&
                                            'bg-primary text-primary-foreground',
                                        isActive &&
                                            'bg-primary text-primary-foreground ring-primary/30 ring-2',
                                        !isCompleted &&
                                            !isActive &&
                                            'bg-muted text-muted-foreground',
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        stepNumber
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        'text-xs',
                                        isActive
                                            ? 'text-foreground font-medium'
                                            : 'text-muted-foreground',
                                    )}
                                >
                                    {label}
                                </span>
                            </div>

                            {!isLastStep && (
                                <div
                                    className={cn(
                                        'mx-4 mb-5 h-px w-12',
                                        isCompleted
                                            ? 'bg-primary'
                                            : 'bg-border',
                                    )}
                                />
                            )}
                        </Fragment>
                    );
                })}
            </div>
        </div>
    );
}
