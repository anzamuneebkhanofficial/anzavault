import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';

const PROTECTED_ROUTES = ['/dashboard', '/vault', '/payment', '/audit'];
const PUBLIC_AUTH_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. Enforce strict security headers globally across all responses
  const enableCsp = process.env.ENABLE_CSP !== 'false';
  const hstsMaxAge = process.env.HSTS_MAX_AGE || '63072000';
  const allowedOrigins = process.env.ALLOWED_ORIGINS || process.env.APP_BASE_URL || '';

  if (enableCsp) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
    );
  }

  if (allowedOrigins) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigins);
  }

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  response.headers.set('Strict-Transport-Security', `max-age=${hstsMaxAge}; includeSubDomains; preload`);
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // 2. Check auth tokens for protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedApiRoute = pathname.startsWith('/api/vault') || pathname.startsWith('/api/payment') || pathname.startsWith('/api/admin');

  const accessToken = request.cookies.get('anza_vault_access')?.value;
  let isAuthenticated = false;

  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) {
      isAuthenticated = true;
    }
  }

  // Handle protected page routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Handle protected API routes
  if (isProtectedApiRoute && !isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized. Authentication session required.' },
      { status: 401 }
    );
  }

  // Redirect authenticated user away from login page to dashboard
  if (isPublicAuthRoute && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets (_next/static, _next/image, favicon.ico)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
