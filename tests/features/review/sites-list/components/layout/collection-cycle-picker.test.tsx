import { expect, test, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { collectionCycleSchema } from '@/api/collection-cycle/validation/collection-cycle-schema';
import CollectionCyclePicker from '@/features/review/sites-list/components/layout/collection-cycle-picker';
import ReviewSitesListHeader from '@/features/review/sites-list/components/layout/review-sites-list-header';
import type { ReviewTab } from '@/features/review/view-state/use-review-filters';
import messages from '../../../../../../messages/en.json';

const collectionCycles = [7, 8].map(id =>
    collectionCycleSchema.parse({
        id,
        programId: 1,
        collectionScheduleId: 1,
        cycleNumber: id,
        startDate: Date.parse('2026-10-01T00:00:00Z'),
        endDate: Date.parse('2026-10-31T00:00:00Z'),
        timezone: 'UTC',
        createdAt: 0,
        updatedAt: 0,
    }),
);

function renderPicker({
    single = false,
    initialCycleIds = [],
    disabled = false,
}: {
    single?: boolean;
    initialCycleIds?: number[];
    disabled?: boolean;
} = {}) {
    const onChange = vi.fn();
    function ControlledPicker() {
        const [selectedCycleIds, setSelectedCycleIds] =
            useState(initialCycleIds);
        return (
            <CollectionCyclePicker
                collectionCycles={collectionCycles}
                selectedCycleIds={selectedCycleIds}
                onSelectedCycleIdsChange={ids => {
                    setSelectedCycleIds(ids);
                    onChange(ids);
                }}
                single={single}
                disabled={disabled}
            />
        );
    }
    render(
        <NextIntlClientProvider locale="en" timeZone="UTC" messages={messages}>
            <ControlledPicker />
        </NextIntlClientProvider>,
    );
    return onChange;
}

test('preserves multi-selection and keeps the menu open by default', async () => {
    const onChange = renderPicker();
    const user = userEvent.setup();
    const trigger = screen.getByRole('combobox', {
        name: messages.CollectionCycle.filterByCycle,
    });
    await user.click(trigger);
    expect(
        screen.queryByPlaceholderText(messages.CollectionCycle.searchCycles),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: /Cycle 7/ }));
    expect(onChange).toHaveBeenLastCalledWith([7]);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('option', { name: /Cycle 8/ }));
    expect(onChange).toHaveBeenLastCalledWith([7, 8]);
    await user.click(screen.getByRole('option', { name: /Cycle 7/ }));
    expect(onChange).toHaveBeenLastCalledWith([8]);
});

test('single mode supports searching, replacement, clearing, and closing on selection', async () => {
    const onChange = renderPicker({ single: true });
    const user = userEvent.setup();
    const trigger = screen.getByRole('combobox', {
        name: messages.CollectionCycle.filterByCycle,
    });
    expect(trigger).toHaveTextContent(messages.CollectionCycle.allCycles);
    await user.click(trigger);
    await user.type(
        screen.getByPlaceholderText(messages.CollectionCycle.searchCycles),
        'Cycle 7',
    );
    expect(
        screen.queryByRole('option', { name: /Cycle 8/ }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: /Cycle 7/ }));
    expect(onChange).toHaveBeenLastCalledWith([7]);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveTextContent('Cycle 7');
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: /Cycle 8/ }));
    expect(onChange).toHaveBeenLastCalledWith([8]);
    expect(trigger).toHaveTextContent('Cycle 8');
    expect(trigger).not.toHaveTextContent('Cycle 7');
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: /Cycle 8/ }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(trigger).toHaveTextContent(messages.CollectionCycle.allCycles);
});

test('single mode displays the first inherited cycle without changing the stored selection on mount', async () => {
    const onChange = renderPicker({ single: true, initialCycleIds: [7, 8] });
    const trigger = screen.getByRole('combobox', {
        name: messages.CollectionCycle.filterByCycle,
    });
    expect(trigger).toHaveTextContent('Cycle 7');
    expect(trigger).not.toHaveTextContent('Cycle 8');
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.setup().click(trigger);
    await userEvent
        .setup()
        .click(screen.getByRole('option', { name: /Cycle 8/ }));
    expect(onChange).toHaveBeenLastCalledWith([8]);
});

test('honors the disabled state in single mode', async () => {
    const onChange = renderPicker({ single: true, disabled: true });
    const trigger = screen.getByRole('combobox', {
        name: messages.CollectionCycle.filterByCycle,
    });
    expect(trigger).toBeDisabled();
    await userEvent.setup().click(trigger);
    expect(
        screen.queryByPlaceholderText(messages.CollectionCycle.searchCycles),
    ).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
});

test('the header reuses single mode for specimens and multi mode for sessions when switching tabs', async () => {
    const onChange = vi.fn();
    function Header() {
        const [activeTab, setActiveTab] = useState<ReviewTab>('sessions');
        const [selectedCycleIds, setSelectedCycleIds] = useState([7, 8]);
        return (
            <ReviewSitesListHeader
                tabs={[
                    { value: 'sessions', label: 'Sessions' },
                    { value: 'specimens', label: 'Specimens' },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                locationTypeName="Site"
                locationDropdownOptions={[]}
                selectedLocation=""
                onLocationChange={vi.fn()}
                collectionCycles={collectionCycles}
                selectedCycleIds={selectedCycleIds}
                onSelectedCycleIdsChange={ids => {
                    setSelectedCycleIds(ids);
                    onChange(ids);
                }}
                selectedReviewStates={[]}
                onSelectedReviewStatesChange={vi.fn()}
                disabled={false}
                startMonth={new Date('2026-10-01T00:00:00Z')}
                endMonth={new Date('2026-10-01T00:00:00Z')}
                onStartMonthChange={vi.fn()}
                onEndMonthChange={vi.fn()}
                maxDate={new Date('2026-10-31T00:00:00Z')}
            />
        );
    }
    render(
        <NextIntlClientProvider locale="en" timeZone="UTC" messages={messages}>
            <Header />
        </NextIntlClientProvider>,
    );
    const user = userEvent.setup();
    const trigger = screen.getByRole('combobox', {
        name: messages.CollectionCycle.filterByCycle,
    });
    expect(trigger).toHaveTextContent('Cycle 7');
    expect(trigger).toHaveTextContent('Cycle 8');
    await user.click(screen.getByRole('tab', { name: 'Specimens' }));
    expect(trigger).toHaveTextContent('Cycle 7');
    expect(trigger).not.toHaveTextContent('Cycle 8');
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: /Cycle 8/ }));
    expect(onChange).toHaveBeenLastCalledWith([8]);
    await user.click(screen.getByRole('tab', { name: 'Sessions' }));
    await user.click(trigger);
    expect(
        screen.queryByPlaceholderText(messages.CollectionCycle.searchCycles),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: /Cycle 7/ }));
    expect(onChange).toHaveBeenLastCalledWith([8, 7]);
});
