import { Session } from '@/lib/entities/session';
import { Site } from '@/lib/entities/site';

interface SpecimenMetadataProps {
  session?: Session;
  site?: Site;
}

export function SpecimenMetadata({ session, site }: SpecimenMetadataProps) {
  const collectionMethod = session?.collectionMethod ?? 'Unknown';
  const collector = `${session?.collectorName}, ${session?.collectorTitle}`;
  const specimenCondition = session?.specimenCondition ?? 'Unknown';
  const siteName = `House #${site?.houseNumber}, ${site?.villageName}`;

  return (
    <div className="grid w-full grid-cols-1 gap-4 text-sm sm:grid-cols-2 sm:gap-x-12">
      <dl className="space-y-3">
        <div className="grid gap-1">
          <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Site
          </dt>
          <dd className="text-foreground font-medium">{siteName}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Collection Method
          </dt>
          <dd className="text-foreground font-medium">{collectionMethod}</dd>
        </div>
      </dl>
      <dl className="space-y-3">
        <div className="grid gap-1">
          <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Collector
          </dt>
          <dd className="text-foreground font-medium">{collector}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Specimen Condition
          </dt>
          <dd className="text-foreground font-medium">{specimenCondition}</dd>
        </div>
      </dl>
    </div>
  );
}
