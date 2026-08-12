import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_COOKIE_NAME } from '@/lib/auth-session/cookies';

const PUBLIC_ROUTES = new Set(['/login', '/signup', '/forbidden']);
const PUBLIC_PREFIXES = ['/docs'];

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

    const isPublic =
        PUBLIC_ROUTES.has(pathname) ||
        PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));

    if (!accessToken) {
        if (isPublic) {
            return NextResponse.next();
        }
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set(
            'redirect',
            request.nextUrl.pathname + request.nextUrl.search,
        );
        return NextResponse.redirect(loginUrl);
    }

    if (!pathname.includes('/forbidden') && PUBLIC_ROUTES.has(pathname)) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
