'use client';

interface SectionHeaderProps {
  title: string;
  className?: string;
}

export function SectionHeader({ title, className = '' }: SectionHeaderProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <div className="h-px bg-gray-200"></div>
    </div>
  );
}
