import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import type { SiteDiscrepancySummary } from '@/features/review/hooks/use-data-quality';

interface SiteDiscrepanciesCardProps {
  siteDiscrepancies: SiteDiscrepancySummary[];
}

export function SiteDiscrepanciesCard({
  siteDiscrepancies,
}: SiteDiscrepanciesCardProps) {
  return (
    <Card className="shadow-lg border-amber-300 bg-amber-50/60">
      <CardHeader className="border-b border-amber-200/70 pb-6">
        <CardTitle className="flex flex-wrap items-center gap-2 text-amber-900">
          Site Discrepancies
          <Badge variant="secondary" className="bg-amber-200 text-amber-900">
            {siteDiscrepancies.length} site
            {siteDiscrepancies.length === 1 ? '' : 's'}
          </Badge>
        </CardTitle>
        <CardDescription>Conflicting session values by site.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 py-6">
        {siteDiscrepancies.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed border-amber-200 bg-amber-100/40 px-5 py-10 text-center text-sm">
            No discrepancies detected for the selected period.
          </div>
        ) : (
          <div className="space-y-4">
            {siteDiscrepancies.map(site => (
              <div
                key={site.siteId}
                className="rounded-xl border border-amber-200/80 bg-white/80 p-5 shadow-sm"
              >
                <header className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-foreground text-base font-semibold">
                      {site.siteLabel.topLine}
                    </p>
                    {site.siteLabel.bottomLine && (
                      <p className="text-muted-foreground text-sm">
                        {site.siteLabel.bottomLine}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge
                        variant="outline"
                        className="border-amber-300 text-amber-900"
                      >
                        {site.sessionCount}{' '}
                        session{site.sessionCount === 1 ? '' : 's'}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-amber-200 text-amber-900"
                      >
                        {site.fields.length} field
                        {site.fields.length === 1 ? '' : 's'}
                      </Badge>
                    </div>
                  </div>
                </header>

                <div className="mt-4 overflow-hidden rounded-lg border border-amber-200 bg-amber-100/40">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-amber-100/60">
                        <TableHead className="w-[180px] text-amber-900">
                          Field
                        </TableHead>
                        <TableHead className="text-amber-900">
                          Conflicting Values Recorded
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {site.fields.map(field => (
                        <TableRow
                          key={`${site.siteId}-${field.key}`}
                          className="hover:bg-amber-100/60"
                        >
                          <TableCell className="text-sm font-medium text-amber-900">
                            {field.label}
                          </TableCell>
                          <TableCell className="text-sm text-foreground">
                            {field.details}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
