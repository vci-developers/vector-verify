import { useEffect, type ComponentProps } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import type SpecimenImageCarousel from '@/components/specimen/specimen-image-carousel';
import { TooltipProvider } from '@/components/ui/tooltip';
import ImageReviewWorkspace from '@/features/review/workspace/image/components/image-review-workspace';
import { createSpecimen } from '../../../../../helpers/create-specimen';
import { createReviewLog } from '../../../../../helpers/create-review-log';
import { createTestQueryClient } from '../../../../../helpers/create-query-client';
import messages from '../../../../../../messages/en.json';

const mocks = vi.hoisted(() => ({ specimens: vi.fn(), logs: vi.fn() }));
vi.mock('@/api/specimen/hooks/use-get-all-specimens', () => ({
    useGetAllSpecimens: mocks.specimens,
}));
vi.mock('@/api/review-log/hooks/use-get-all-review-logs', () => ({
    useGetAllReviewLogs: mocks.logs,
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock(
    '@/features/review/workspace/image/components/prediction-edit-form',
    () => ({
        default: ({ onClose }: { onClose: () => void }) => (
            <button onClick={onClose}>Cancel prediction</button>
        ),
    }),
);
vi.mock('@/components/specimen/specimen-image-carousel', () => ({
    default: function MockSpecimenImageCarousel({
        specimen,
        navigationDisabled,
        onCurrentImageChange,
        onImageAvailabilityChange,
    }: ComponentProps<typeof SpecimenImageCarousel>) {
        useEffect(() => {
            onCurrentImageChange?.(specimen.images?.[0] ?? null);
        }, [specimen, onCurrentImageChange]);
        useEffect(() => {
            onImageAvailabilityChange?.('pending');
        }, [specimen, onImageAvailabilityChange]);
        return (
            <div data-testid="carousel" data-locked={navigationDisabled}>
                <button
                    disabled={navigationDisabled}
                    onClick={() =>
                        onCurrentImageChange?.(specimen.images?.[1] ?? null)
                    }
                >
                    Other image
                </button>
                <button onClick={() => onImageAvailabilityChange?.('loaded')}>
                    Images ready
                </button>
                <button onClick={() => onImageAvailabilityChange?.('error')}>
                    Fail image
                </button>
                <button onClick={() => onImageAvailabilityChange?.('pending')}>
                    Images pending
                </button>
            </div>
        );
    },
}));

const specimen = createSpecimen();
const specimens = [specimen, createSpecimen({ id: 13, specimenId: 'URJ207' })];

beforeEach(() => {
    mocks.specimens.mockReturnValue({
        data: { ok: true, data: { specimens } },
        isPending: false,
    });
    mocks.logs.mockReturnValue({
        data: { ok: true, data: { logs: [] } },
        isError: false,
    });
});
afterEach(() => vi.unstubAllGlobals());

function renderWorkspace(readOnly = false) {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    const queryClient = createTestQueryClient();
    const { rerender } = render(
        <NextIntlClientProvider locale="en" timeZone="UTC" messages={messages}>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <ImageReviewWorkspace
                        site={{
                            siteId: 89,
                            programId: 1,
                            locationHierarchy: {},
                            isActive: true,
                        }}
                        sessions={[]}
                        collectionCycleId={7}
                        readOnly={readOnly}
                        onGoToPreviousStep={onPrevious}
                        onGoToNextStep={onNext}
                    />
                </TooltipProvider>
            </QueryClientProvider>
        </NextIntlClientProvider>,
    );
    return { onPrevious, onNext, rerender };
}

function expectNavigationLocked(locked: boolean) {
    const buttons = [
        screen.getByRole('button', { name: 'Next Specimen' }),
        screen.getByRole('button', { name: 'Previous' }),
        screen.getByRole('button', { name: 'Continue to Certification' }),
        screen.getByRole('button', { name: 'Other image' }),
    ];
    buttons.forEach(button =>
        locked ? expect(button).toBeDisabled() : expect(button).toBeEnabled(),
    );
    expect(screen.getByTestId('carousel')).toHaveAttribute(
        'data-locked',
        String(locked),
    );
}

async function openEditor(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: 'Images ready' }));
    await user.click(screen.getByRole('button', { name: 'Edit Specimen ID' }));
}

test('blocks editing only while image checks are pending, not after failure', async () => {
    const user = userEvent.setup();
    renderWorkspace();
    const editButton = screen.getByRole('button', { name: 'Edit Specimen ID' });
    expect(editButton).toBeDisabled();
    await user.hover(editButton.parentElement!);
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
        'Checking image availability…',
    );
    await user.unhover(editButton.parentElement!);
    await user.click(screen.getByRole('button', { name: 'Fail image' }));
    expect(editButton).toBeEnabled();
    expect(
        screen.queryByText('Images still uploading'),
    ).not.toBeInTheDocument();
    await user.click(editButton);
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expectNavigationLocked(true);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expectNavigationLocked(false);
});

test('locks workflow and specimen/image navigation until Cancel', async () => {
    const user = userEvent.setup();
    const { onPrevious, onNext } = renderWorkspace();
    await openEditor(user);
    expectNavigationLocked(true);
    await user.click(screen.getByRole('button', { name: 'Next Specimen' }));
    await user.click(screen.getByRole('button', { name: 'Previous' }));
    await user.click(
        screen.getByRole('button', { name: 'Continue to Certification' }),
    );
    expect(onPrevious).not.toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
    expect(
        screen.queryByRole('button', { name: 'Edit' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expectNavigationLocked(false);
});

test('keeps navigation locked for empty input and duplicate errors', async () => {
    vi.stubGlobal(
        'fetch',
        vi
            .fn()
            .mockResolvedValue(
                Response.json(
                    { ok: false, error: { kind: 'conflict', status: 409 } },
                    { status: 409 },
                ),
            ),
    );
    const user = userEvent.setup();
    renderWorkspace();
    await openEditor(user);
    await user.clear(screen.getByRole('textbox'));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
        'Enter a Specimen ID.',
    );
    expectNavigationLocked(true);
    await user.type(screen.getByRole('textbox'), 'DUPLICATE');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
        'A specimen with this ID already exists.',
    );
    expectNavigationLocked(true);
});

test.each(['Images ready', 'Fail image'])(
    'saves and unlocks navigation after %s',
    async imageStatus => {
        const updatedSpecimen = { ...specimen, specimenId: 'NEW-ID' };
        vi.stubGlobal(
            'fetch',
            vi.fn().mockImplementation(async () => {
                mocks.specimens.mockReturnValue({
                    data: {
                        ok: true,
                        data: { specimens: [updatedSpecimen, specimens[1]] },
                    },
                    isPending: false,
                });
                return Response.json({
                    ok: true,
                    data: { message: 'Updated', specimen: updatedSpecimen },
                });
            }),
        );
        const user = userEvent.setup();
        renderWorkspace();
        await user.click(screen.getByRole('button', { name: imageStatus }));
        await user.click(
            screen.getByRole('button', { name: 'Edit Specimen ID' }),
        );
        await user.clear(screen.getByRole('textbox'));
        await user.type(screen.getByRole('textbox'), 'NEW-ID');
        await user.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() =>
            expect(screen.queryByRole('textbox')).not.toBeInTheDocument(),
        );
        expectNavigationLocked(false);
        expect(screen.getByText('NEW-ID')).toBeInTheDocument();
    },
);

test('image failures allow Save, but pending checks block it without unlocking navigation', async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await openEditor(user);
    await user.click(screen.getByRole('button', { name: 'Fail image' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expectNavigationLocked(true);
    await user.click(screen.getByRole('button', { name: 'Images pending' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    expect(screen.getByRole('status')).toHaveTextContent(
        'Checking image availability…',
    );
    expectNavigationLocked(true);
    await user.click(screen.getByRole('button', { name: 'Fail image' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expectNavigationLocked(true);
    await user.click(screen.getByRole('button', { name: 'Images ready' }));
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
});

test('the open form survives a specimen query failure and can still be cancelled', async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await openEditor(user);
    await user.type(screen.getByRole('textbox'), '-DRAFT');
    mocks.specimens.mockReturnValue({
        data: { ok: false, error: { kind: 'server' } },
        isPending: false,
    });
    await user.click(screen.getByRole('button', { name: 'Images pending' }));
    expect(screen.getByRole('textbox')).toHaveValue('URJ206-DRAFT');
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
});

test('preserves the edited specimen and draft when refetching changes list order', async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await openEditor(user);
    await user.type(screen.getByRole('textbox'), '-DRAFT');
    mocks.specimens.mockReturnValue({
        data: {
            ok: true,
            data: { specimens: [specimens[1], { ...specimen }] },
        },
        isPending: false,
    });
    await user.click(screen.getByRole('button', { name: 'Images pending' }));
    expect(screen.getByRole('textbox')).toHaveValue('URJ206-DRAFT');
    expect(screen.getByText('Specimen 2 of 2')).toBeInTheDocument();
    expect(
        screen.getByRole('button', { name: 'Previous Specimen' }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByText('URJ206')).toBeInTheDocument();
    expect(
        screen.getByRole('button', { name: 'Previous Specimen' }),
    ).toBeEnabled();
});

test('blocks previous-specimen navigation when editing the second specimen', async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(screen.getByRole('button', { name: 'Next Specimen' }));
    expect(
        screen.getByRole('button', { name: 'Previous Specimen' }),
    ).toBeEnabled();
    await openEditor(user);
    expect(
        screen.getByRole('button', { name: 'Previous Specimen' }),
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
        screen.getByRole('button', { name: 'Previous Specimen' }),
    ).toBeEnabled();
});

test.each(['Images ready', 'Fail image'])(
    'editing remains unavailable on fully reviewed sites after %s',
    async imageStatus => {
        const user = userEvent.setup();
        renderWorkspace(true);
        await user.click(screen.getByRole('button', { name: imageStatus }));
        expect(
            screen.queryByRole('button', { name: 'Edit Specimen ID' }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Edit' }),
        ).not.toBeInTheDocument();
    },
);

test.each(['Images ready', 'Fail image'])(
    'editing remains unavailable for a non-thumbnail image after %s',
    async imageStatus => {
        const user = userEvent.setup();
        renderWorkspace();
        await user.click(screen.getByRole('button', { name: imageStatus }));
        await user.click(screen.getByRole('button', { name: 'Other image' }));
        expect(
            screen.queryByRole('button', { name: 'Edit Specimen ID' }),
        ).not.toBeInTheDocument();
    },
);

test('the prediction editor and ID editor cannot be open together', async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(screen.getByRole('button', { name: 'Images ready' }));
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(
        screen.getByRole('button', { name: 'Cancel prediction' }),
    ).toBeInTheDocument();
    expect(
        screen.queryByRole('button', { name: 'Edit Specimen ID' }),
    ).not.toBeInTheDocument();
});

test('specimen switches reset the upload guard instead of reusing prior success', async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(screen.getByRole('button', { name: 'Images ready' }));
    expect(
        screen.getByRole('button', { name: 'Edit Specimen ID' }),
    ).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Next Specimen' }));
    expect(screen.getByText('URJ207')).toBeInTheDocument();
    expect(
        screen.getByRole('button', { name: 'Edit Specimen ID' }),
    ).toBeDisabled();
});

test.each([
    null,
    { userId: 3, name: null },
    { userId: 3, name: 'Last reviewer' },
])(
    'shows sticky original ID and latest editor, even after restoring the original: %j',
    performedBy => {
        const logs = [
            createReviewLog({
                id: 1,
                action: 'update_specimen_thumbnail_prediction',
                fields: { specimenId: 12 },
                changes: { specimenId: { before: 'URJ206', after: 'TEMP' } },
                createdAt: 1000,
            }),
            createReviewLog({
                id: 2,
                action: 'update_specimen_thumbnail_prediction',
                fields: { specimenId: 12 },
                changes: { specimenId: { before: 'TEMP', after: 'URJ206' } },
                createdAt: 2000,
                performedBy,
            }),
        ];
        mocks.logs.mockImplementation(({ action }) => ({
            data: {
                ok: true,
                data: {
                    logs:
                        action === 'update_specimen_thumbnail_prediction'
                            ? logs
                            : [],
                },
            },
        }));
        renderWorkspace();
        expect(screen.getByText('Edited', { exact: true })).toBeInTheDocument();
        expect(screen.getByText('Original: URJ206')).toBeInTheDocument();
        expect(
            screen.getByText(
                `Edited by ${performedBy?.name ?? 'Unknown user'}`,
            ),
        ).toBeInTheDocument();
        expect(mocks.logs).toHaveBeenCalledWith({
            siteId: 89,
            collectionCycleId: 7,
            action: 'update_specimen_thumbnail_prediction',
        });
    },
);

test('reports thrown history errors with a translated fallback', async () => {
    mocks.logs.mockReturnValue({ isError: true });
    renderWorkspace();
    await act(async () => {});
    expect(
        screen.getByText('Failed to load review edits.'),
    ).toBeInTheDocument();
});
