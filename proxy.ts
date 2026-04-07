import createMiddleware from 'next-intl/middleware';
import type { ProxyConfig } from 'next/server';
import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config: ProxyConfig = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
