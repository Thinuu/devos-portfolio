import { NextRequest, NextResponse } from 'next/server';

const cookieName = process.env.AUTH_COOKIE_NAME || 'portfolio_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login/') || pathname === '/api/auth/session') {
    return NextResponse.next();
  }
  const isProtectedAdminRoute =
    pathname === '/admin'
    || pathname.startsWith('/admin/')
    || pathname.startsWith('/api/admin/');

  if (!isProtectedAdminRoute) return NextResponse.next();

  const session = request.cookies.get(cookieName)?.value;
  if (session) return NextResponse.next();

  if (pathname.startsWith('/api/admin/')) {
    return NextResponse.json(
      { error: 'Administrator session required.' },
      { status: 401 },
    );
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
