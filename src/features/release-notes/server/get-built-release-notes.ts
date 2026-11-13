import 'server-only';

import { releaseNoteSummarySchema } from '../validation/release-note-summary-schema';

export function getBuiltReleaseNotes() {
    return releaseNoteSummarySchema
        .nullable()
        .parse(JSON.parse(process.env.RELEASE_NOTES_DATA ?? 'null'));
}
