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
import type { MissingSiteSummary } from '@/features/review/hooks/use-data-quality';

interface MissingSitesCardProps {
  sites: MissingSiteSummary[];
}

export function MissingSitesCard({ sites }: MissingSitesCardProps) {
  return (
    <Card className="shadow-lg border-destructive/60 bg-destructive/5">
      <CardHeader className="border-b pb-6">
        <CardTitle className="flex items-center gap-2 text-destructive">
          Missing Data
          <Badge variant="destructive">{sites.length}</Badge>
        </CardTitle>
        <CardDescription>Sites without sessions for this period.</CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        {sites.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed border-destructive/40 bg-background/60 px-5 py-10 text-center text-sm">
            Sessions were reported for every site you can access in this district.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-destructive/30 bg-background shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-destructive/10 hover:bg-destructive/10">
                  <TableHead className="w-[38%] text-destructive">
                    Site
                  </TableHead>
                  <TableHead className="text-destructive/90">Parish</TableHead>
                  <TableHead className="text-destructive/90">
                    Sub-county
                  </TableHead>
                  <TableHead className="text-destructive/90">
                    Health Center
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sites.map(({ site, display }) => (
                  <TableRow key={site.siteId} className="hover:bg-destructive/5">
                    <TableCell>
                      <span className="text-sm font-semibold text-foreground">
                        {display || `Site #${site.siteId}`}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {site.parish ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {site.subCounty ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {site.healthCenter ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
