import type { Metadata } from 'next';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

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
  description: 'Role-aware web app for monthly data quality control of mosquito-surveillance data',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col`}
      >
        {/* Simplified header with NavigationMenu */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm flex items-center gap-1.5 hover:text-foreground/80 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Dashboard
              </Link>

              <div className="h-6 w-px bg-border hidden sm:block" />

              <NavigationMenu viewport={false}>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-2 p-2 w-[200px]">
                        <NavigationMenuLink
                          href="/"
                          className="flex items-center gap-2 p-2 hover:bg-accent rounded-md"
                        >
                          Dashboard
                        </NavigationMenuLink>
                        <NavigationMenuLink
                          href="/annotate"
                          className="flex items-center gap-2 p-2 hover:bg-accent rounded-md"
                        >
                          Annotations
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <Link href="/" className="font-medium text-lg">
                VectorVerify
              </Link>
            </div>

            <button className="rounded-full h-8 w-8 hover:bg-accent transition-colors flex items-center justify-center">
              <User className="h-4 w-4" />
              <span className="sr-only">User account</span>
            </button>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
