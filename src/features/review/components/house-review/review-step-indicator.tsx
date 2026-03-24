import { cn } from '@/utils/cn';

interface Step {
    number: number;
    label: string;
}

const STEPS: Step[] = [
    { number: 1, label: 'Surveillance Form Comparison' },
    { number: 2, label: 'Image Review' },
    { number: 3, label: 'Certification' },
];

interface ReviewStepIndicatorProps {
    currentStep: number;
}

export default function ReviewStepIndicator({
    currentStep,
}: ReviewStepIndicatorProps) {
    return (
        <div className="flex items-center justify-center gap-0">
            {STEPS.map((step, index) => (
                <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                                currentStep === step.number
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground',
                            )}
                        >
                            {step.number}
                        </div>
                        <span
                            className={cn(
                                'max-w-[120px] text-center text-xs leading-tight',
                                currentStep === step.number
                                    ? 'text-foreground font-medium'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {step.label}
                        </span>
                    </div>
                    {index < STEPS.length - 1 && (
                        <div className="bg-border mb-5 mx-3 h-px w-16 shrink-0" />
                    )}
                </div>
            ))}
        </div>
    );
}
