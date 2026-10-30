import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
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
