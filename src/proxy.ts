import { NextResponse, type NextRequest } from 'next/server';
import { ACCESS_COOKIE_NAME } from './features/auth_new/lib/cookies';

const PUBLIC_ROUTES = new Set(['/login', '/signup', '/login_new', '/signup_new']);

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const accessToken = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

    if (PUBLIC_ROUTES.has(pathname) && accessToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!accessToken && !PUBLIC_ROUTES.has(pathname)) {
        return NextResponse.redirect(new URL('/login_new', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
