import { NextResponse } from 'next/server';
import { COOKIE, verifySession } from './lib/session';

export async function middleware(req) {
  const session = await verifySession(req.cookies.get(COOKIE)?.value);
  const { pathname, search } = req.nextUrl;
  if (!session) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith('/admin') && session.role !== 'admin') return NextResponse.redirect(new URL('/dashboard', req.url));
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/dashboard/:path*'] };
