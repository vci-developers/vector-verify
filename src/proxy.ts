import { NextResponse, type NextRequest } from 'next/server';
import {
    ACCESS_COOKIE_NAME,
    VERIFIED_COOKIE_NAME,
} from '@/lib/auth-session/cookies';

const PUBLIC_ROUTES = new Set(['/login', '/signup', '/forbidden']);
const AUTH_ONLY_ROUTES = new Set(['/verify-email']);
const PUBLIC_PREFIXES = ['/docs'];

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
    const emailVerified =
        request.cookies.get(VERIFIED_COOKIE_NAME)?.value === 'true';

    const isPublic =
        PUBLIC_ROUTES.has(pathname) ||
        PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
    const isAuthOnly = AUTH_ONLY_ROUTES.has(pathname);

    if (
        !pathname.includes('/forbidden') &&
        (isPublic || isAuthOnly) &&
        accessToken &&
        emailVerified
    ) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (!accessToken && !isPublic && !isAuthOnly && !emailVerified) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (!accessToken && isAuthOnly) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set(
            'redirect',
            request.nextUrl.pathname + request.nextUrl.search,
        );
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
