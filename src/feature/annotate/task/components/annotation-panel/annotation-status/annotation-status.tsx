import { AlertCircle, Clock, FileCheck } from 'lucide-react';

import AnnotationStatusCard from './annotation-status-card';

type AnnotationStatusProps = {
  annotated: number;
  pending: number;
  flagged: number;
};

export default function AnnotationStatus({ annotated, pending, flagged }: AnnotationStatusProps) {
  return (
    <div className="flex flex-col gap-1.5 pt-2">
      <h3 className="text-sm font-medium">Status Breakdown</h3>
      <div className="grid grid-cols-3 gap-2">
        <AnnotationStatusCard
          icon={FileCheck}
          variant="primary"
          label="Completed"
          count={annotated}
        />
        <AnnotationStatusCard icon={Clock} variant="warning" label="Pending" count={pending} />
        <AnnotationStatusCard
          icon={AlertCircle}
          variant="destructive"
          label="Flagged"
          count={flagged}
        />
      </div>
    </div>
  );
}
