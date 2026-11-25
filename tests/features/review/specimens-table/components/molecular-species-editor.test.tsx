import { afterEach, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';
import { err, ok } from '@/lib/result/result';
import MolecularSpeciesEditor from '@/features/review/specimens-table/components/molecular-species-editor';
import messages from '../../../../../messages/en.json';
import { createTestQueryClient } from '../../../../helpers/create-query-client';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

const editLabel = 'Edit molecular species for specimen CMS007';

const specimen = specimenSchema.parse({
    id: 7,
    specimenId: 'CMS007',
    sessionId: 1401,
    thumbnailUrl: null,
    thumbnailImageId: null,
    thumbnailImage: null,
    molecularSpecies: 'An. gambiae',
});

function renderEditor(saveSucceeds = true) {
    const fetchMock = vi.fn(async () =>
        Response.json(
            saveSucceeds
                ? ok({ message: '', specimen })
                : err({ kind: 'server', message: 'Failed' }),
        ),
    );
    vi.stubGlobal('fetch', fetchMock);
    render(
        <QueryClientProvider client={createTestQueryClient()}>
            <NextIntlClientProvider
                locale="en"
                timeZone="UTC"
                messages={messages}
            >
                <MolecularSpeciesEditor specimen={specimen} />
            </NextIntlClientProvider>
        </QueryClientProvider>,
    );
    return fetchMock;
}

async function openEditor() {
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: editLabel }));
    return { user, input: screen.getByRole('textbox', { name: editLabel }) };
}

test('cancel returns to the saved value without saving', async () => {
    const fetchMock = renderEditor();
    const { user, input } = await openEditor();
    expect(input).toHaveValue('An. gambiae');
    await user.type(input, ' changed');
    await user.click(
        screen.getByRole('button', { name: messages.Common.cancel }),
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('An. gambiae')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
});

test.each([
    [' An. arabiensis ', 'An. arabiensis'],
    ['   ', null],
])(
    'saves the trimmed molecular species and sends null when empty: %j',
    async (typedValue, savedValue) => {
        const fetchMock = renderEditor();
        const { user, input } = await openEditor();
        await user.clear(input);
        await user.type(input, typedValue);
        await user.click(
            screen.getByRole('button', { name: messages.Common.save }),
        );
        await waitFor(() =>
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument(),
        );
        expect(fetchMock).toHaveBeenCalledWith(
            '/api/specimens/7',
            expect.objectContaining({
                method: 'PUT',
                body: JSON.stringify({ molecularSpecies: savedValue }),
            }),
        );
    },
);

test('keeps the editor open when saving fails', async () => {
    const fetchMock = renderEditor(false);
    const { user } = await openEditor();
    await user.click(
        screen.getByRole('button', { name: messages.Common.save }),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(
        screen.getByRole('textbox', { name: editLabel }),
    ).toBeInTheDocument();
});

test.each([
    ['the request is rejected', () => Promise.reject(new Error('Offline'))],
    [
        'the response is not JSON',
        async () => new Response('<html>Bad Gateway</html>', { status: 502 }),
    ],
])(
    'shows an error toast and keeps the draft when %s',
    async (_failure, fetchImplementation) => {
        renderEditor();
        const fetchMock = vi.fn(fetchImplementation);
        vi.stubGlobal('fetch', fetchMock);
        const { user, input } = await openEditor();
        await user.clear(input);
        await user.type(input, 'An. funestus');
        await user.click(
            screen.getByRole('button', { name: messages.Common.save }),
        );
        await waitFor(() =>
            expect(toast.error).toHaveBeenCalledWith(
                messages.ReviewSpecimens.molecularSpeciesSaveError,
            ),
        );
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('textbox', { name: editLabel })).toHaveValue(
            'An. funestus',
        );
        expect(
            screen.getByRole('button', { name: messages.Common.save }),
        ).toBeEnabled();
    },
);

test('shows an error and does not save when the molecular species is too long', async () => {
    const fetchMock = renderEditor();
    const { user, input } = await openEditor();
    await user.clear(input);
    await user.click(input);
    await user.paste('a'.repeat(256));
    await user.click(
        screen.getByRole('button', { name: messages.Common.save }),
    );
    expect(
        await screen.findByText(
            messages.ReviewSpecimens.molecularSpeciesTooLong,
        ),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
});
