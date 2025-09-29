import { Loader2 } from 'lucide-react';

export function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="text-primary h-8 w-8 animate-spin" />
      <span className="text-muted-foreground ml-2">Loading review data...</span>
    </div>
  );
}
