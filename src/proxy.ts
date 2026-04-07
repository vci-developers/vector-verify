import { NextResponse, type NextRequest, type ProxyConfig } from 'next/server';
import { ACCESS_COOKIE_NAME } from './lib/auth-session/cookies';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const PUBLIC_ROUTES = new Set(['/login', '/signup', '/forbidden']);

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

    if (
        !pathname.includes('/forbidden') &&
        PUBLIC_ROUTES.has(pathname) &&
        accessToken
    ) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (!accessToken && !PUBLIC_ROUTES.has(pathname)) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return handleI18nRouting(request);
}

export const config: ProxyConfig = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
