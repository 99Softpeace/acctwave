import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow webhook requests to pass through without any redirects
    if (pathname.startsWith('/api/pocketfi/webhook')) {
        // Don't modify the request, just let it through
        return NextResponse.next();
    }

    // For all other routes, use default behavior
    return NextResponse.next();
}

// Only run middleware on API routes to minimize overhead
export const config = {
    matcher: '/api/:path*',
};
