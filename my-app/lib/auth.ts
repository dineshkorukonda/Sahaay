import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

/**
 * Extracts and verifies JWT token from either Authorization header (mobile) or cookie (web)
 * Returns the userId if token is valid, null otherwise
 */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
    try {
        // Try Authorization header first (mobile apps)
        const authHeader = req.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                const { payload } = await jwtVerify(token, JWT_SECRET);
                return payload.userId as string;
            } catch {
                // Token invalid, continue to try cookie
            }
        }

        // Fallback to cookie (web apps)
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (token) {
            try {
                const { payload } = await jwtVerify(token, JWT_SECRET);
                return payload.userId as string;
            } catch {
                // Token invalid
                return null;
            }
        }

        return null;
    } catch (error) {
        console.error('Auth Error:', error);
        return null;
    }
}

/**
 * Verifies if a request is authenticated
 * Returns userId if authenticated, throws error otherwise
 * Note: This function throws an error that should be caught by the API route handler
 */
export async function requireAuth(req: Request): Promise<string> {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
        const err = new Error('Unauthorized') as Error & { status: number };
        err.status = 401;
        throw err;
    }
    return userId;
}
