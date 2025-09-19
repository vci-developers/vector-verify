import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ENV } from '@/lib/shared/config/env';

const AUTH_ROUTES = new Set(['/login', '/signup']);
const PUBLIC_FILE = /\.(.*)$/;

function isStaticRoute(pathname: string): boolean {
  if (pathname.startsWith('/_next')) return true;
  if (pathname.startsWith('/api')) return true;
  if (pathname === '/favicon.ico') return true;
  return PUBLIC_FILE.test(pathname);
}

function isProtectedRoute(pathname: string): boolean {
  if (AUTH_ROUTES.has(pathname)) return false;
  if (isStaticRoute(pathname)) return false;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticRoute(pathname)) {
    return NextResponse.next();
  }

  const isAuthRoute = AUTH_ROUTES.has(pathname);
  const isProtected = isProtectedRoute(pathname);

  if (!isAuthRoute && !isProtected) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: ENV.NEXTAUTH_SECRET });
  const hasAccessToken = typeof token?.accessToken === 'string';

  if (isAuthRoute) {
    if (!hasAccessToken) {
      return NextResponse.next();
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  if (!hasAccessToken) {
    const redirectTarget = `${pathname}${request.nextUrl.search}`;
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    loginUrl.searchParams.set('redirectTo', redirectTarget);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|manifest.json).*)'],
};
