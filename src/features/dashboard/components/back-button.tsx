'use client';

import { Button } from '@/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  show: boolean;
}

/**
 * BackButton component responsible for navigation back functionality
 * Single responsibility: Handle back navigation and display
 */
export function BackButton({ show }: BackButtonProps) {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  if (!show) {
    return <div className="w-20" />;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBackClick}
      className="flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Previous
    </Button>
  );
}
