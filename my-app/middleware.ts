import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    // Paths that require authentication
    const protectedPaths = ['/dashboard', '/onboarding'];
    const path = request.nextUrl.pathname;

    const isProtected = protectedPaths.some((prefix) => path.startsWith(prefix));

    if (isProtected) {
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.next();
        } catch (error) {
            console.error('Middleware Token Verification Failed:', error);
            // Redirect to login if token is invalid
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (authentication routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    ],
};
