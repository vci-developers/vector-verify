import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/styles/globals.css';
import Providers from './providers';
import { Toaster } from '@/ui/sonner';
import { RouteErrorToaster } from '@/shared/components/route-error-toaster';

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
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col antialiased`}
      >
        <Toaster richColors position="top-center" />
        <Providers>
          <RouteErrorToaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
