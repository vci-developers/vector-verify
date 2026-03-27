import { Separator } from '@/components/ui/separator';
import SurveillanceFormReviewTable from '@/features/review/components/site-detail/surveillance-form-review/surveillance-form-review-table';
import type { SessionWithForm } from '@/features/review/components/site-detail/surveillance-form-review/types';

interface SurveillanceFormReviewWorkspaceProps {
    surveillanceForms: SessionWithForm[];
}

export default function SurveillanceFormReviewWorkspace({
    surveillanceForms,
}: SurveillanceFormReviewWorkspaceProps) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="h-10 text-lg font-semibold">
                    Step 1: Surveillance Form Comparison
                </h2>
                <p className="text-muted-foreground text-sm">
                    Review and resolve any discrepancies across sessions. All
                    sessions must match.
                </p>
            </div>

            <Separator />

            <SurveillanceFormReviewTable
                surveillanceForms={surveillanceForms}
            />
        </div>
    );
}
