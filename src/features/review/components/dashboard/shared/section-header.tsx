'use client';

interface SectionHeaderProps {
  title: string;
  className?: string;
  showBreakline?: boolean;
}

export function SectionHeader({ title, className = '', showBreakline = false }: SectionHeaderProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {showBreakline && <div className="h-px bg-gray-200"></div>}
      <h2 className="text-xl font-bold" style={{ color: '#64738b' }}>{title}</h2>
    </div>
  );
}
