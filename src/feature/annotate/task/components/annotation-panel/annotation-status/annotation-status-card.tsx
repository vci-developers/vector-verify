import { cva, type VariantProps } from "class-variance-authority";

const annotationStatusCardVariants = cva("p-1.5 rounded-md", {
  variants: {
    variant: {
      primary: "bg-primary/20 text-primary",
      warning: "bg-warning/20 text-warning",
      destructive: "bg-destructive/20 text-destructive",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

interface AnnotationStatusCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
}

export default function AnnotationStatusCard({
  icon: Icon,
  variant,
  label,
  count,
}: AnnotationStatusCardProps &
  VariantProps<typeof annotationStatusCardVariants>) {
  return (
    <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
      <div className={annotationStatusCardVariants({ variant })}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-center w-full">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{count}</p>
      </div>
    </div>
  );
}
