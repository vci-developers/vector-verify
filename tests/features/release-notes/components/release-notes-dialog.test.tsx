import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import {
    Sidebar,
    SidebarMenu,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import ReleaseNotesDialog from '@/features/release-notes/components/release-notes-dialog';
import ReleaseNotesTrigger from '@/features/release-notes/components/release-notes-trigger';
import type { ReleaseNoteSummary } from '@/features/release-notes/server/get-release-notes';
import messages from '../../../../messages/en.json';

vi.mock('@/lib/hooks/use-mobile', () => ({ useIsMobile: () => true }));

const release: ReleaseNoteSummary = {
    id: '2026-11-03',
    date: '2026-11-03',
    title: 'November 3, 2026',
    changes: [
        {
            id: 'image-review',
            title: 'Image review',
            summary: 'Correct the predicted species on any thumbnail.',
        },
    ],
};

beforeEach(() => {
    window.localStorage.clear();
});

afterEach(() => {
    vi.restoreAllMocks();
});

function renderMobileShell() {
    render(
        <NextIntlClientProvider locale="en" timeZone="UTC" messages={messages}>
            <SidebarProvider>
                <ReleaseNotesDialog release={release}>
                    <Sidebar collapsible="icon">
                        <SidebarMenu>
                            <ReleaseNotesTrigger />
                        </SidebarMenu>
                    </Sidebar>
                    <SidebarTrigger />
                </ReleaseNotesDialog>
            </SidebarProvider>
        </NextIntlClientProvider>,
    );
}

test('automatically shows an unseen release while the mobile drawer is closed', async () => {
    const user = userEvent.setup();
    renderMobileShell();

    expect(
        await screen.findByRole('dialog', { name: messages.ReleaseNotes.title }),
    ).toBeInTheDocument();
    expect(
        screen.queryByRole('button', { name: messages.Sidebar.whatsNew }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Image review/ })).toHaveAttribute(
        'href',
        '/docs/release-notes/2026-11-03#image-review',
    );

    await user.keyboard('{Escape}');

    await waitFor(() => {
        expect(
            screen.queryByRole('dialog', { name: messages.ReleaseNotes.title }),
        ).not.toBeInTheDocument();
    });
    expect(window.localStorage.getItem('release-notes-seen:2026-11-03')).toBe(
        'true',
    );
});

test('shows and dismisses the release when access to localStorage is blocked', async () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
        throw new DOMException('Storage is blocked', 'SecurityError');
    });
    const user = userEvent.setup();
    renderMobileShell();

    expect(
        await screen.findByRole('dialog', { name: messages.ReleaseNotes.title }),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
        expect(
            screen.queryByRole('dialog', { name: messages.ReleaseNotes.title }),
        ).not.toBeInTheDocument();
    });
});

test('dismisses the release when storage writes exceed the quota', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('Storage is full', 'QuotaExceededError');
    });
    const user = userEvent.setup();
    renderMobileShell();

    expect(
        await screen.findByRole('dialog', { name: messages.ReleaseNotes.title }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: messages.Common.close }));

    await waitFor(() => {
        expect(
            screen.queryByRole('dialog', { name: messages.ReleaseNotes.title }),
        ).not.toBeInTheDocument();
    });
});

test('keeps a seen release closed until its mobile sidebar action is clicked', async () => {
    window.localStorage.setItem('release-notes-seen:2026-11-03', 'true');
    const user = userEvent.setup();
    renderMobileShell();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Toggle Sidebar' }));
    expect(
        screen.queryByRole('dialog', { name: messages.ReleaseNotes.title }),
    ).not.toBeInTheDocument();

    await user.click(
        screen.getByRole('button', { name: messages.Sidebar.whatsNew }),
    );

    expect(
        await screen.findByRole('dialog', { name: messages.ReleaseNotes.title }),
    ).toBeInTheDocument();
});
