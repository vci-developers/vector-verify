interface StandardCellProps {
  value?: string | null;
}

export function StandardCell({ value }: StandardCellProps) {
  return (
    <span className="text-foreground inline-block text-sm">{value ?? '—'}</span>
  value?: string | null | undefined;
}

export function StandardCell({ value }: StandardCellProps) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground inline-block text-sm">—</span>;
  }

  return (
    <span className="text-foreground inline-block text-sm">{value}</span>
  );
}
