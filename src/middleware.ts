import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is trying to access protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const session = request.cookies.get('next-auth.session-token');
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/knowledge/:path*', '/tickets/:path*', '/tracker/:path*'],
};
