'use client';

import { Card, CardContent } from '@/ui/card';
import { ReactNode } from 'react';

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  className?: string;
}

export function InfoCard({
  icon,
  title,
  value,
  className = '',
}: InfoCardProps) {
  return (
    <Card className={`relative ${className}`}>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
            {icon}
          </div>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200">
            <span className="text-xs text-gray-500">i</span>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className="text-3xl font-bold text-gray-800">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
