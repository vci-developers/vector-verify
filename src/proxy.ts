import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_COOKIE_NAME } from './lib/auth-session/cookies';

const PUBLIC_ROUTES = new Set([
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/forbidden',
]);
const PUBLIC_PREFIXES = ['/docs'];

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

    if (
        !pathname.includes('/forbidden') &&
        PUBLIC_ROUTES.has(pathname) &&
        accessToken
    ) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    const isPublic =
        PUBLIC_ROUTES.has(pathname) ||
        PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));

    if (!accessToken && !isPublic) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
