import { Card, CardContent } from '@/ui/card';

interface ErrorStateProps {
  message?: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="mb-2 text-lg font-semibold text-red-600">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-600">
              {message || 'An unexpected error occurred'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

