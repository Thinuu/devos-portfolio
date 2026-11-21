import { NextRequest, NextResponse } from 'next/server';

const cookieName = process.env.AUTH_COOKIE_NAME || 'portfolio_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(cookieName)?.value;

  // Visiting /admin/login while already authenticated redirects to /admin
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
    if (session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Allow public auth endpoints
  if (pathname === '/api/auth/session' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const isProtectedAdminRoute =
    pathname === '/admin'
    || pathname.startsWith('/admin/')
    || pathname.startsWith('/api/admin/');

  if (!isProtectedAdminRoute) return NextResponse.next();

  if (session) return NextResponse.next();

  if (pathname.startsWith('/api/admin/')) {
    return NextResponse.json(
      { error: 'Administrator session required.' },
      { status: 401 },
    );
  }

  // Redirect to /admin/login with safe path
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  loginUrl.searchParams.set('next', pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
