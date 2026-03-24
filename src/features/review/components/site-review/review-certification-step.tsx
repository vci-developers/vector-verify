'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface ReviewCertificationStepProps {
    houseNumber: string;
    startDate: string;
    onBack: () => void;
    onCertify: () => void;
    isCertifying: boolean;
}

export default function ReviewCertificationStep({
    houseNumber,
    startDate,
    onBack,
    onCertify,
    isCertifying,
}: ReviewCertificationStepProps) {
    const [isConfirmed, setIsConfirmed] = useState(false);

    const formattedMonth = format(
        new Date(startDate + 'T00:00:00'),
        'MMMM yyyy',
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Step 3: Certification</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    Certify that all data for this house in {formattedMonth} is
                    accurate and complete.
                </p>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
                <Checkbox
                    id="certify-checkbox"
                    checked={isConfirmed}
                    onCheckedChange={checked =>
                        setIsConfirmed(checked === true)
                    }
                    className="mt-0.5"
                />
                <Label
                    htmlFor="certify-checkbox"
                    className="cursor-pointer space-y-2"
                >
                    <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                        I certify that this house&apos;s data for{' '}
                        {formattedMonth} is accurate
                    </span>
                    <p className="text-xs text-green-800 dark:text-green-200">
                        By checking this box, I confirm that:
                    </p>
                    <ul className="list-none space-y-1">
                        {[
                            'All surveillance form discrepancies have been resolved',
                            'All specimen images have been reviewed',
                            'All data is accurate and ready for submission',
                        ].map(item => (
                            <li
                                key={item}
                                className="flex items-start gap-1.5 text-xs text-green-800 dark:text-green-200"
                            >
                                <span className="mt-0.5 shrink-0">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </Label>
            </div>

            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isCertifying}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Button
                    onClick={onCertify}
                    disabled={!isConfirmed || isCertifying}
                >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {isCertifying ? 'Certifying...' : 'Certify House'}
                </Button>
            </div>
        </div>
    );
}
