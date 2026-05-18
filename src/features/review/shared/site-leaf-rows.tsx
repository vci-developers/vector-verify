import type { Site } from '@/api/site/validation/site-schema';
import { Fragment } from 'react';

interface SiteLeafRowsProps {
    sites: Site[];
    renderSiteRow: (site: Site) => React.ReactNode;
    filterSite?: (site: Site) => boolean;
}

export default function SiteLeafRows({
    sites,
    renderSiteRow,
    filterSite,
}: SiteLeafRowsProps) {
    const visibleSites = filterSite ? sites.filter(filterSite) : sites;

    if (visibleSites.length === 0) return null;

    return (
        <div className="space-y-1">
            {visibleSites.map(site => (
                <Fragment key={site.siteId}>{renderSiteRow(site)}</Fragment>
            ))}
        </div>
    );
}
