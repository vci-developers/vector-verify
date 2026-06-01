'use client';

import * as React from 'react';
import { ChevronsUpDown } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

interface ComboBoxProps {
    options: string[];
    value: string | undefined;
    onValueChange: (value: string) => void;
    placeholder?: string;
    validate?: (value: string) => string | null;
    disabled?: boolean;
}

export function ComboBox({
    options,
    value,
    onValueChange,
    placeholder = 'Select value...',
    validate,
    disabled,
}: ComboBoxProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');

    const isExactMatch = options.includes(inputValue);
    const showCustomOption = inputValue.length > 0 && !isExactMatch;
    const validationError =
        showCustomOption && validate ? validate(inputValue) : null;

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) setInputValue('');
        setOpen(nextOpen);
    }

    function handleSelect(selected: string) {
        onValueChange(selected);
        setInputValue('');
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-40 justify-between font-normal"
                    disabled={disabled}
                >
                    <span className="truncate">{value ?? placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-0">
                <Command>
                    <CommandInput
                        placeholder="Search..."
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty>No results.</CommandEmpty>
                        <CommandGroup>
                            {options.map(option => (
                                <CommandItem
                                    key={option}
                                    value={option}
                                    onSelect={handleSelect}
                                >
                                    {option}
                                </CommandItem>
                            ))}
                            {showCustomOption && (
                                <CommandItem
                                    value={inputValue}
                                    disabled={!!validationError}
                                    onSelect={() => {
                                        if (!validationError)
                                            handleSelect(inputValue);
                                    }}
                                >
                                    {validationError ? (
                                        <span className="text-destructive text-xs">
                                            {validationError}
                                        </span>
                                    ) : (
                                        `Use "${inputValue}"`
                                    )}
                                </CommandItem>
                            )}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
