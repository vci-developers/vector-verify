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
import type { MissingSiteSummary } from '@/features/review/types';

export function MissingSitesCard({ sites }: { sites: MissingSiteSummary[] }) {
  return (
    <Card className="border-destructive/60 bg-destructive/5 shadow-lg">
      <CardHeader className="border-b pb-6">
        <CardTitle className="text-destructive flex items-center gap-2">
          Missing Data
          <Badge variant="destructive">
            {sites.length} site
            {sites.length === 1 ? '' : 's'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Sites without sessions for this period.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-6">
        {sites.length === 0 ? (
          <div className="text-muted-foreground border-destructive/40 bg-background/60 rounded-lg border border-dashed px-5 py-10 text-center text-sm">
            Sessions were reported for every site in this district.
          </div>
        ) : (
          <div className="border-destructive/30 bg-background overflow-hidden rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-destructive/10 hover:bg-destructive/10">
                  <TableHead className="text-destructive w-[38%]">
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
                  <TableRow
                    key={site.siteId}
                    className="hover:bg-destructive/5"
                  >
                    <TableCell>
                      <span className="text-foreground text-sm font-semibold">
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
