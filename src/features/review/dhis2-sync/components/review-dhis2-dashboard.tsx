'use client';

import type { Dhis2SyncStatus } from '../utils/dhis2-sync-status';
import Dhis2CycleSegment from './dhis2-cycle-segment';
import Dhis2SiteRow from './dhis2-site-row';

// ─── TEMPORARY (Step 2 only) ───────────────────────────────────────────────
// These two interfaces and the fixtures below exist only to render the static
// visual board. They are DELETED in Step 4, when real `Site` /
// `CollectionCycle` / `ReviewSiteSessionSummary` data (from their Zod schemas)
// replaces the hardcoded rows. Do not build on them.
interface FixtureSiteRow {
    siteName: string;
    status: Dhis2SyncStatus;
}

interface FixtureCycle {
    label: string;
    rows: FixtureSiteRow[];
}

const FIXTURE_CYCLES: FixtureCycle[] = [
    {
        label: 'Cycle 3 · 2026',
        rows: [
            { siteName: 'Apac HC IV', status: 'ready' },
            { siteName: 'Aduku HC III', status: 'queued' },
            { siteName: 'Ibuje HC II', status: 'running' },
            { siteName: 'Chegere HC III', status: 'submitted' },
            { siteName: 'Akokoro HC III', status: 'hasNewCertifiedData' },
        ],
    },
    {
        label: 'Cycle 2 · 2026',
        rows: [
            { siteName: 'Anaka General Hospital', status: 'failed' },
            { siteName: 'Koch Goma HC III', status: 'timedOut' },
            { siteName: 'Purongo HC III', status: 'submitted' },
        ],
    },
];
// ─── end TEMPORARY ─────────────────────────────────────────────────────────

export default function ReviewDhis2Dashboard() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-foreground text-sm font-semibold tracking-widest uppercase">
                        DHIS2 Submissions
                    </h2>
                    <p className="text-muted-foreground text-xs">
                        Submit certified sentinel site data to DHIS2 per
                        collection cycle.
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {FIXTURE_CYCLES.map(cycle => (
                    <Dhis2CycleSegment
                        key={cycle.label}
                        label={cycle.label}
                        siteCount={cycle.rows.length}
                    >
                        {cycle.rows.map(row => (
                            <Dhis2SiteRow
                                key={row.siteName}
                                siteName={row.siteName}
                                status={row.status}
                            />
                        ))}
                    </Dhis2CycleSegment>
                ))}
            </div>
        </div>
    );
}
