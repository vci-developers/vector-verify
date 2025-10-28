/**
 * Centralized chart components that re-export Recharts components
 * This provides a clean interface and makes it easier to manage chart dependencies
 */

// Re-export Recharts components that we use
export {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

// Simple chart container and tooltip components
export const ChartContainer = ({ children, className, ...props }: any) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const ChartTooltip = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const ChartTooltipContent = ({
  active,
  payload,
  label,
  ...props
}: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="bg-background rounded-md border px-2 py-1.5 shadow-md"
      {...props}
    >
      <div className="grid gap-1.5">
        <div className="flex items-center gap-2">
          <div className="bg-primary h-2.5 w-2.5 rounded-full" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground text-sm">
              {item.name}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartLegend = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const ChartLegendContent = ({ payload, ...props }: any) => {
  if (!payload?.length) return null;

  return (
    <div className="flex items-center justify-center gap-4" {...props}>
      {payload.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-muted-foreground text-sm">{item.value}</span>
        </div>
      ))}
    </div>
  );
};
