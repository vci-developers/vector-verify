'use client';

import { cn } from '@/utils/cn';
import { Check, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Fragment } from 'react';

interface ReviewSiteDetailsHeaderProps {
    steps: readonly { label: string }[];
    currentStepIndex: number;
}

export default function ReviewSiteDetailsHeader({
    steps,
    currentStepIndex,
}: ReviewSiteDetailsHeaderProps) {
    return (
        <div className="space-y-4">
            <Link
                href="/review"
                className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm transition-colors"
            >
                <ChevronLeft className="h-4 w-3" />
                Back to Sites
            </Link>

            <div className="flex items-center justify-center">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = index < currentStepIndex;
                    const isActive = index === currentStepIndex;
                    const isLastStep = index === steps.length - 1;

                    return (
                        <Fragment key={step.label}>
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
                                    {step.label}
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
