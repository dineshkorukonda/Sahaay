import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const path = request.nextUrl.pathname;

    // Public paths that don't require authentication
    const publicPaths = ['/auth/login', '/', '/api/auth'];
    const isPublicPath = publicPaths.some(publicPath => path.startsWith(publicPath));

    // Protected paths that require authentication
    // All dashboard routes and onboarding are protected
    const protectedPaths = ['/dashboard', '/onboarding'];
    const isProtectedPath = protectedPaths.some(protectedPath => path.startsWith(protectedPath));
    
    // Also protect API routes (except auth routes)
    const isApiRoute = path.startsWith('/api/');
    const isAuthApiRoute = path.startsWith('/api/auth');
    const isProtectedApiRoute = isApiRoute && !isAuthApiRoute;

    // If accessing a protected API route (non-auth)
    if (isProtectedApiRoute) {
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.next();
        } catch (error) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    // If accessing a protected path
    if (isProtectedPath) {
        // Redirect to login if no token
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        // Verify token
        try {
            await jwtVerify(token, JWT_SECRET);
            // Let the page handle onboarding status check via API
            return NextResponse.next();
        } catch (error) {
            console.error('Middleware Token Verification Failed:', error);
            // Clear invalid token and redirect to login
            const response = NextResponse.redirect(new URL('/auth/login', request.url));
            response.cookies.delete('token');
            return response;
        }
    }

    // If accessing login page while already authenticated, redirect based on onboarding
    if (path.startsWith('/auth/login') && token) {
        try {
            await jwtVerify(token, JWT_SECRET);
            // Redirect will be handled by client-side after checking onboarding status
            return NextResponse.next();
        } catch (error) {
            // Token invalid, allow login page
            return NextResponse.next();
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (authentication routes - handled separately)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
