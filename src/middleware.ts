import { NextResponse, type NextRequest } from 'next/server';

const AUTH_ROUTES = new Set(['/login', '/signup']);

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.has(pathname);
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api');
}

function isAuthenticated(req: NextRequest): boolean {
  const cookies = req.cookies;
  const hasAccess = Boolean(cookies.get('vc_access')?.value);
  const hasRefresh = Boolean(cookies.get('vc_refresh')?.value);
  return hasAccess && hasRefresh;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isApiRoute(pathname)) return NextResponse.next();

  const authed = isAuthenticated(req);
  const atAuthRoute = isAuthRoute(pathname);

  if (authed && atAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (!authed && !atAuthRoute) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    const next = encodeURIComponent(req.nextUrl.pathname + (req.nextUrl.search || ''));
    url.search = `next=${next}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
