import { Search } from 'lucide-react';

export function NoAccessView() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-2xl items-center justify-center px-6">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="bg-muted inline-flex h-12 w-12 items-center justify-center rounded-full">
          <Search className="text-muted-foreground h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">No Access Available</h2>
          <p className="text-muted-foreground max-w-md text-sm">
            You don&apos;t currently have access to any features. Please contact
            your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    </div>
  );
}
