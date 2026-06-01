'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { Globe } from 'lucide-react';
import { setUserLocale } from '@/lib/i18n/locale';
import {
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

const LOCALES = [{ value: 'en', label: 'English' }] as const;
type Locale = (typeof LOCALES)[number]['value'];

export default function LocaleSwitcher() {
    const locale = useLocale();
    const router = useRouter();

    function handleLocaleChange(newLocale: string) {
        startTransition(async () => {
            await setUserLocale(newLocale as Locale);
            router.refresh();
        });
    }

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Globe className="h-4 w-4" />
                Language
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                    value={locale}
                    onValueChange={handleLocaleChange}
                >
                    {LOCALES.map(({ value, label }) => (
                        <DropdownMenuRadioItem key={value} value={value}>
                            {label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    );
}
