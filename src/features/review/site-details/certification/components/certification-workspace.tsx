'use client';

import { Button } from '@/components/ui/button';

interface CertificationWorkspaceProps {
    onGoToPreviousStep: () => void;
}

export default function CertificationWorkspace({
    onGoToPreviousStep,
}: CertificationWorkspaceProps) {
    return (
        <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
                Certification coming soon.
            </p>

            <div className="flex justify-between">
                <Button variant="outline" onClick={onGoToPreviousStep}>
                    Back
                </Button>
                <Button disabled>Certify Site</Button>
            </div>
        </div>
    );
}
