'use client';

import { Check } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '@/utils/cn';

interface ReviewSiteDetailHeaderProps {
    steps: { label: string }[];
    currentStep: number;
}

export default function ReviewSiteDetailHeader({
    steps,
    currentStep,
}: ReviewSiteDetailHeaderProps) {
    return (
        <div className="flex items-center justify-center">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isActive = stepNumber === currentStep;

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

                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    'mx-4 mb-5 h-px w-12',
                                    isCompleted ? 'bg-primary' : 'bg-border',
                                )}
                            />
                        )}
                    </Fragment>
                );
            })}
        </div>
    );
}
