import { expect, test, vi } from 'vitest';
import { useState, type ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import SpecimenTableFilter from '@/features/review/specimens-table/components/specimen-table-filter';
import messages from '../../../../../messages/en.json';

function renderFilter(props: ComponentProps<typeof SpecimenTableFilter>) {
    function ControlledFilter() {
        const [value, setValue] = useState(props.value);
        return (
            <SpecimenTableFilter
                {...props}
                value={value}
                onValueChange={nextValue => {
                    setValue(nextValue);
                    props.onValueChange(nextValue);
                }}
            />
        );
    }
    render(
        <NextIntlClientProvider locale="en" messages={messages}>
            <ControlledFilter />
        </NextIntlClientProvider>,
    );
}

const filterCases = [
    {
        field: 'site',
        option: { value: '90', label: 'AD 70' },
        other: { value: '91', label: 'Other site' },
        term: 'AD 70',
    },
    {
        field: 'species',
        option: { value: 'Anopheles gambiae', label: 'Anopheles gambiae' },
        other: { value: 'Culex', label: 'Culex' },
        term: 'gambiae',
    },
    {
        field: 'sex',
        option: { value: 'Female', label: 'Translated female' },
        other: { value: 'Male', label: 'Translated male' },
        term: 'female',
    },
    {
        field: 'abdomenStatus',
        option: { value: 'Fully Fed', label: 'Translated fed' },
        other: { value: 'Gravid', label: 'Translated gravid' },
        term: 'Translated fed',
    },
] as const;

test.each(filterCases)(
    'searches $field labels, selects one backend value, and clears the filter',
    async ({ field, option, other, term }) => {
        const onValueChange = vi.fn();
        const user = userEvent.setup();
        renderFilter({
            field,
            value: 'all',
            allLabel: 'All options',
            options: [option, other],
            onValueChange,
        });
        const trigger = screen.getByRole('combobox', {
            name: messages.ReviewSpecimens[field],
        });
        await user.click(trigger);
        await user.type(
            screen.getByPlaceholderText(
                messages.ReviewSpecimens.filterSearch[field],
            ),
            term,
        );
        expect(
            screen.queryByRole('option', { name: other.label }),
        ).not.toBeInTheDocument();
        await user.click(screen.getByRole('option', { name: option.label }));
        expect(onValueChange).toHaveBeenLastCalledWith(option.value);
        expect(trigger).toHaveTextContent(option.label);
        expect(trigger).toHaveAttribute('aria-expanded', 'false');

        await user.click(trigger);
        await user.click(screen.getByRole('option', { name: other.label }));
        expect(onValueChange).toHaveBeenLastCalledWith(other.value);
        expect(trigger).toHaveTextContent(other.label);
        expect(trigger).not.toHaveTextContent(option.label);

        await user.click(trigger);
        await user.click(screen.getByRole('option', { name: 'All options' }));
        expect(onValueChange).toHaveBeenLastCalledWith('all');
        expect(trigger).toHaveTextContent('All options');
    },
);

test('shows translated empty-search feedback without offering custom filter values', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderFilter({
        field: 'site',
        value: 'all',
        allLabel: 'All sites',
        options: [{ value: '90', label: 'AD 70' }],
        onValueChange,
    });
    await user.click(
        screen.getByRole('combobox', { name: messages.ReviewSpecimens.site }),
    );
    await user.type(
        screen.getByPlaceholderText(messages.ReviewSpecimens.filterSearch.site),
        'not a site',
    );
    expect(
        screen.getByText(messages.ReviewSpecimens.noFilterResults),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(onValueChange).not.toHaveBeenCalled();
});

test('supports keyboard selection and deselecting the current value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderFilter({
        field: 'site',
        value: 'all',
        allLabel: 'All sites',
        options: [{ value: '90', label: 'AD 70' }],
        onValueChange,
    });
    const trigger = screen.getByRole('combobox', {
        name: messages.ReviewSpecimens.site,
    });
    await user.tab();
    await user.keyboard('{Enter}');
    await user.type(
        screen.getByPlaceholderText(messages.ReviewSpecimens.filterSearch.site),
        'AD 70',
    );
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('90');
    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'AD 70' }));
    expect(onValueChange).toHaveBeenLastCalledWith('all');
});
