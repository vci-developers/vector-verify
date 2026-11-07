import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, test, vi } from 'vitest';
import { toast } from 'sonner';
import { specimenKeys } from '@/api/specimen/specimen-keys';
import { reviewLogKeys } from '@/api/review-log/review-log-keys';
import SpecimenIdEditForm from '@/features/review/workspace/image/components/specimen-id-edit-form';
import { createSpecimen } from '../../../../../helpers/create-specimen';
import { createTestQueryClient } from '../../../../../helpers/create-query-client';
import messages from '../../../../../../messages/en.json';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
afterEach(() => vi.unstubAllGlobals());

const specimen = createSpecimen();

function renderForm(canSave = true) {
    const queryClient = createTestQueryClient();
    const onClose = vi.fn();
    const content = (allowed: boolean) => (
        <NextIntlClientProvider locale="en" timeZone="UTC" messages={messages}>
            <QueryClientProvider client={queryClient}>
                <SpecimenIdEditForm
                    specimen={specimen}
                    canSave={allowed}
                    onClose={onClose}
                />
            </QueryClientProvider>
        </NextIntlClientProvider>
    );
    const rendered = render(content(canSave));
    return {
        ...rendered,
        queryClient,
        onClose,
        setCanSave: (allowed: boolean) => rendered.rerender(content(allowed)),
    };
}

test('trims the input, invalidates both query roots, and waits for refresh before closing', async () => {
    const fetchMock = vi
        .fn()
        .mockResolvedValue(
            Response.json({ ok: true, data: { message: 'Updated', specimen } }),
        );
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    const { queryClient, onClose } = renderForm();
    let finishRefresh!: () => void;
    const refreshing = new Promise<void>(resolve => {
        finishRefresh = resolve;
    });
    const invalidate = vi
        .spyOn(queryClient, 'invalidateQueries')
        .mockReturnValue(refreshing);
    await user.clear(screen.getByRole('textbox', { name: 'Specimen ID' }));
    await user.type(screen.getByRole('textbox'), '  NEW-ID  ');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(invalidate).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenCalledWith(
        '/api/specimens/12',
        expect.objectContaining({
            body: JSON.stringify({ specimenId: 'NEW-ID' }),
        }),
    );
    expect(invalidate).toHaveBeenCalledWith({ queryKey: specimenKeys.root });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: reviewLogKeys.root });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    expect(onClose).not.toHaveBeenCalled();
    await act(async () => finishRefresh());
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(toast.success).toHaveBeenCalledWith('Specimen ID updated.');
});

test('rejects whitespace-only input without sending a request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    const { onClose } = renderForm();
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), '   ');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
        'Enter a Specimen ID.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
});

test('shows duplicates inline, preserves the input and permits correction or Cancel', async () => {
    const fetchMock = vi
        .fn()
        .mockResolvedValue(
            Response.json(
                { ok: false, error: { kind: 'conflict', status: 409 } },
                { status: 409 },
            ),
        );
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    const { onClose } = renderForm();
    await user.clear(screen.getByRole('textbox'));
    await user.type(screen.getByRole('textbox'), 'DUPLICATE');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
        'A specimen with this ID already exists.',
    );
    expect(screen.getByRole('textbox')).toHaveValue('DUPLICATE');
    expect(onClose).not.toHaveBeenCalled();
    await user.type(screen.getByRole('textbox'), '-NEW');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
});

test.each(['backend', 'network'])(
    'keeps the form open with a translated fallback on %s failure',
    async kind => {
        const fetchMock =
            kind === 'network'
                ? vi.fn().mockRejectedValue(new Error('Offline'))
                : vi.fn().mockResolvedValue(
                      Response.json(
                          {
                              ok: false,
                              error: { kind: 'server', status: 500 },
                          },
                          { status: 500 },
                      ),
                  );
        vi.stubGlobal('fetch', fetchMock);
        const user = userEvent.setup();
        const { onClose } = renderForm();
        await user.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() =>
            expect(toast.error).toHaveBeenCalledWith(
                'Failed to update Specimen ID.',
            ),
        );
        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    },
);

test('blocks repeat submission and Cancel during the save', async () => {
    let finishSave!: (response: Response) => void;
    const response = new Promise<Response>(resolve => {
        finishSave = resolve;
    });
    const fetchMock = vi.fn().mockReturnValue(response);
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    const { onClose } = renderForm();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.click(screen.getByRole('button', { name: 'Saving…' }));
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
    await act(async () =>
        finishSave(
            Response.json({
                ok: false,
                error: { kind: 'server', status: 500 },
            }),
        ),
    );
    await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled(),
    );
});

test('rechecks permission/availability at submission and leaves Cancel usable', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    const { container, onClose, setCanSave } = renderForm();
    setCanSave(false);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    fireEvent.submit(container.querySelector('form')!);
    await waitFor(() => expect(fetchMock).not.toHaveBeenCalled());
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
});
