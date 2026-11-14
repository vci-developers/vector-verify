import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import {
    releaseNoteSummarySchema,
    type ReleaseNoteSummary,
} from '../validation/release-note-summary-schema';

const releaseNotesDirectory = path.join(process.cwd(), 'content/release-notes');
const releaseFilenamePattern = /^(\d{4}-\d{2}-\d{2})\.mdx$/;
const changePattern = /^## (.+)\n+([^\n]+(?:\n(?!\n|#)[^\n]+)*)/gm;

export function getLatestReleaseNotes(): ReleaseNoteSummary | undefined {
    const releaseId = readdirSync(releaseNotesDirectory)
        .map(filename => releaseFilenamePattern.exec(filename)?.[1])
        .filter((id): id is string => id !== undefined)
        .sort((left, right) => right.localeCompare(left))[0];

    if (!releaseId) {
        return undefined;
    }

    const content = readFileSync(
        path.join(releaseNotesDirectory, `${releaseId}.mdx`),
        'utf8',
    );
    const title = content.match(/^# (.+)$/m)?.[1];

    if (!title) {
        return undefined;
    }

    const changes = Array.from(content.matchAll(changePattern), match => {
        const heading = match[1];
        const summary = match[2];

        if (!heading || !summary) {
            return undefined;
        }

        return {
            id: heading
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, ''),
            title: heading,
            summary: summary.trim().replace(/\s+/g, ' '),
        };
    }).filter(
        (change): change is NonNullable<typeof change> => change !== undefined,
    );

    return releaseNoteSummarySchema.parse({
        id: releaseId,
        date: releaseId,
        title,
        changes,
    });
}
