import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import {
    formQuestionTypeSchema,
    type FormQuestionType,
} from '@/api/form-question/validation/form-question-schema';
import ConflictResolutionControl from '@/features/review/workspace/metadata/components/conflict-resolution-control';
import messages from '../../../../../../messages/en.json';

function renderControl(
    fieldType: FormQuestionType,
    value: string | string[] | undefined,
    onValueChange: (value: string | string[]) => void,
) {
    render(
        <NextIntlClientProvider locale="en" messages={messages}>
            <ConflictResolutionControl
                fieldType={fieldType}
                options={[]}
                questionOptions={['Indoors', 'Outdoors']}
                isOtherTextEnabled={false}
                value={value}
                timezone="Africa/Nairobi"
                onValueChange={onValueChange}
                disabled={false}
            />
        </NextIntlClientProvider>,
    );
}

test.each(formQuestionTypeSchema.options)(
    'renders a control for %s questions',
    fieldType => {
        renderControl(fieldType, undefined, vi.fn());
        expect(screen.getByText('Select value')).toBeInTheDocument();
    },
);

test('adds a multi-select option to the list', async () => {
    const onValueChange = vi.fn();
    renderControl('multi-select', ['Indoors'], onValueChange);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: 'Outdoors' }));
    expect(onValueChange).toHaveBeenCalledWith(['Indoors', 'Outdoors']);
});

test('clears a multi-select answer when the last option is removed', async () => {
    const onValueChange = vi.fn();
    renderControl('multi-select', ['Indoors'], onValueChange);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(
        screen.getByRole('option', { name: 'Indoors', selected: true }),
    );
    expect(onValueChange).toHaveBeenCalledWith('N/A');
});

test('keeps a saved option that left the form visible', async () => {
    renderControl('multi-select', ['Retired option'], vi.fn());
    await userEvent.click(screen.getByRole('combobox'));
    expect(
        screen.getByRole('option', { name: 'Retired option' }),
    ).toBeInTheDocument();
});
