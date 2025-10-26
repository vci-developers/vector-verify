interface StandardCellProps {
  value?: string | null;
}

export function StandardCell({ value }: StandardCellProps) {
  return <span className="text-foreground text-sm">{value ?? '—'}</span>;
}
