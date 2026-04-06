import '@/app/globals.css';
import { TanstackProvider } from '@/components/providers/tanstack-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'VectorVerify',
    description:
        'Role-aware web app for monthly data quality control of mosquito-surveillance data',
};

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    return (
        <html lang={locale} className="h-full">
            <body
                className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col antialiased`}
            >
                <NextIntlClientProvider>
                    <TooltipProvider delayDuration={200}>
                        <TanstackProvider>{children}</TanstackProvider>
                    </TooltipProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
