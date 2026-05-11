'use client';

import { Button } from '@/components/ui/button';

interface ImageReviewWorkspaceProps {
    onGoToPreviousStep: () => void;
    onGoToNextStep: () => void;
}

export default function ImageReviewWorkspace({
    onGoToPreviousStep,
    onGoToNextStep,
}: ImageReviewWorkspaceProps) {
    return (
        <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
                Image review coming soon.
            </p>

            <div className="flex justify-between">
                <Button variant="outline" onClick={onGoToPreviousStep}>
                    Back
                </Button>
                <Button onClick={onGoToNextStep}>
                    Continue to Certification
                </Button>
            </div>
        </div>
    );
}
