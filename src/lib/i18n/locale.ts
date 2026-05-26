'use server';

import { cookies } from 'next/headers';

const SUPPORTED_LOCALES = ['en'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: SupportedLocale = 'en';

export async function getUserLocale(): Promise<SupportedLocale> {
    const value = (await cookies()).get('LOCALE')?.value;
    return (SUPPORTED_LOCALES as readonly string[]).includes(value ?? '')
        ? (value as SupportedLocale)
        : DEFAULT_LOCALE;
}

export async function setUserLocale(locale: SupportedLocale): Promise<void> {
    (await cookies()).set('LOCALE', locale, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}
