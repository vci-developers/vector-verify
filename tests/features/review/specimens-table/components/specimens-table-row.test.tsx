import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { siteSchema } from '@/api/site/validation/site-schema';
import { sessionSchema } from '@/api/session/validation/session-schema';
import { NextIntlClientProvider } from 'next-intl';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';
import { Table, TableBody } from '@/components/ui/table';
import SpecimensTableRow from '@/features/review/specimens-table/components/specimens-table-row';
import messages from '../../../../../messages/en.json';

test.each(['', null, undefined, 'populated'] as const)(
    'renders consistent placeholders without hiding populated values: %s',
    value => {
        const populated = value === 'populated';
        const specimen = specimenSchema.parse({
            id: 7,
            specimenId: 'CMS007',
            sessionId: 1401,
            thumbnailUrl: null,
            thumbnailImageId: null,
            thumbnailImage:
                value === undefined
                    ? null
                    : {
                          id: 99,
                          url: 'image.jpg',
                          species: populated ? 'Aedes' : value,
                          sex: populated ? 'Male' : value,
                          abdomenStatus: populated ? 'Unfed' : value,
                          appSpecies: null,
                          appSex: null,
                          appAbdomenStatus: null,
                      },
            images: [],
        });
        render(
            <NextIntlClientProvider
                locale="en"
                timeZone="UTC"
                messages={messages}
            >
                <Table>
                    <TableBody>
                        <SpecimensTableRow
                            specimen={specimen}
                            cycleLabel=""
                            reviewLogs={[]}
                            reviewLogsError={false}
                            hasCollectionCycles={false}
                        />
                    </TableBody>
                </Table>
            </NextIntlClientProvider>,
        );
        const cells = screen.getAllByRole('cell');
        expect(cells[0]).toHaveTextContent('—');
        expect(cells[3]).toHaveTextContent('—');
        expect(cells[4]).toHaveTextContent(populated ? 'Aedes' : '—');
        expect(cells[5]).toHaveTextContent(populated ? 'Male' : '—');
        expect(cells[6]).toHaveTextContent(populated ? 'Unfed' : '—');
        expect(cells[7]).toHaveTextContent('0');
    },
);

test.each(['modern', 'legacy', 'missing', 'unnamed'] as const)(
    'uses the same site label in the table and drawer for a %s site',
    async kind => {
        const session = sessionSchema.parse({
            sessionId: 1401,
            frontendId: 'session-1401',
            collectorName: 'Collector',
            collectorTitle: 'Officer',
            collectionDate: 0,
            collectionMethod: 'Trap',
            specimenCondition: '',
            createdAt: 0,
            completedAt: null,
            submittedAt: 0,
            notes: '',
            siteId: 90,
            deviceId: 1,
            type: 'SURVEILLANCE',
            state: 'NEEDS_REVIEW',
            latitude: null,
            longitude: null,
            collectionCycleId: 7,
        });
        const specimen = specimenSchema.parse({
            id: 7,
            specimenId: 'CMS007',
            sessionId: session.sessionId,
            thumbnailUrl: null,
            thumbnailImageId: null,
            thumbnailImage: null,
            images: [],
        });
        const site =
            kind === 'missing'
                ? undefined
                : siteSchema.parse({
                      siteId: 90,
                      programId: 1,
                      isActive: true,
                      locationHierarchy:
                          kind === 'modern' ? { District: 'East' } : {},
                      name: 'AD 70',
                      houseNumber: kind === 'unnamed' ? null : 'House 12',
                  });
        const expectedSiteLabel =
            kind === 'modern'
                ? 'AD 70'
                : kind === 'legacy'
                  ? 'House 12'
                  : kind === 'missing'
                    ? '90'
                    : '—';
        render(
            <NextIntlClientProvider
                locale="en"
                timeZone="UTC"
                messages={messages}
            >
                <Table>
                    <TableBody>
                        <SpecimensTableRow
                            specimen={specimen}
                            session={session}
                            site={site}
                            reviewLogs={[
                                { id: 1, specimenId: 7, createdAt: 0 },
                            ]}
                            reviewLogsError={false}
                            hasCollectionCycles
                        />
                    </TableBody>
                </Table>
            </NextIntlClientProvider>,
        );
        expect(screen.getAllByRole('cell')[3]).toHaveTextContent(
            expectedSiteLabel,
        );
        await userEvent
            .setup()
            .click(screen.getByRole('button', { name: /CMS007/ }));
        expect(screen.getByRole('dialog')).toHaveAccessibleDescription(
            `Session 1401 · ${expectedSiteLabel}`,
        );
    },
);
