import { Card, CardContent } from '@/ui/card';

interface EmptyStateProps {
  district: string;
  monthName: string;
}

export function EmptyState({ district, monthName }: EmptyStateProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="mb-2 text-lg font-semibold text-gray-600">
              No Data Available
            </h2>
            <p className="text-gray-500">
              No data found for {district} in {monthName}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

