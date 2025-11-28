'use client';

import { Button } from '@/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Loader2 } from 'lucide-react';
import { VscArrowRight } from 'react-icons/vsc';

interface LandingPageCardProps {
  icon: React.ReactNode;
  title: string;
  description: string[];
  onClick: () => void;
  isLoading: boolean;
}

export function LandingPageCard({
  icon,
  title,
  description,
  onClick,
  isLoading,
}: LandingPageCardProps) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <div className="flex items-center gap-8 py-3 pr-6 pl-10">
        <div className="flex-shrink-0">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-[#e0f2f1]">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          </CardHeader>
          <CardDescription className="text-base leading-relaxed">
            {description.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </CardDescription>
        </div>
        <div className="flex-shrink-0">
          <Button
            onClick={onClick}
            disabled={isLoading}
            size="sm"
            className="flex h-14 w-14 cursor-pointer items-center justify-center bg-[#4ebd8b] p-0 text-white hover:bg-[#3d9570] disabled:cursor-not-allowed"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : (
              <VscArrowRight style={{ width: '36px', height: '36px' }} />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
