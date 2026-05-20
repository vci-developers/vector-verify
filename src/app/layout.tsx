import '@/app/globals.css';
import { TanstackProvider } from '@/components/providers/tanstack-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <TooltipProvider delayDuration={200}>
                        <TanstackProvider>{children}</TanstackProvider>
                    </TooltipProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
