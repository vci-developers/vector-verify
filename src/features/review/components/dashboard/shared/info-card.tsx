'use client';

import { Card, CardContent } from '@/ui/card';
import { ReactNode, useState } from 'react';
import Image from 'next/image';

interface InfoCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  className?: string;
  tooltipContent?: string;
}

export function InfoCard({
  icon,
  title,
  value,
  className = '',
  tooltipContent,
}: InfoCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Card className={`relative py-0 ${className}`}>
      <CardContent className="p-0">
        <div className="px-6 pt-6 pb-6">
          <div className="mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: '#E0F2F1' }}>
            {icon}
          </div>
            <div 
              className="absolute top-6 right-6 cursor-pointer"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Image
                src="/assets/auth/icons/Info.svg"
                alt="Info"
                width={20}
                height={20}
                className="object-contain"
                style={{ filter: 'brightness(0) saturate(100%) invert(38%) sepia(7%) saturate(940%) hue-rotate(201deg) brightness(95%) contrast(89%)' }}
              />
              {showTooltip && (
                <div className="absolute right-0 top-8 z-50 w-64 rounded-md border bg-white px-3 py-2 shadow-lg">
                  <p className="text-sm text-gray-700">
                    {tooltipContent || title}
                  </p>
                </div>
              )}
          </div>
        </div>
        <div className="space-y-2">
            <h3 className="text-sm font-medium" style={{ color: '#98a3b2' }}>{title}</h3>
          <div className="text-3xl font-bold text-gray-800">
            {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
