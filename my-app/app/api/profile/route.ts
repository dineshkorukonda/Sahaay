import { NextResponse } from 'next/server';
import connectDB, { isUuid, isUniqueViolation, withId } from '@/lib/db';
import { profiles, users } from '@/lib/schema';
import { and, eq, ne } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

async function resolveUserId(req: Request): Promise<string | null> {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.userId as string;
    }
    const token = (await cookies()).get('token')?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
}

export async function GET(req: Request) {
    try {
        const db = await connectDB();
        const userId = await resolveUserId(req);
        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [user, profile] = await Promise.all([
            db.select({
                id: users.id,
                name: users.name,
                email: users.email,
                mobile: users.mobile,
            }).from(users).where(eq(users.id, userId)).limit(1).then((rows) => rows[0]),
            db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1).then((rows) => rows[0]),
        ]);

        return NextResponse.json({
            success: true,
            data: {
                user: user ? withId(user) : null,
                profile: profile ? withId(profile) : null
            }
        });
    } catch (error: unknown) {
        console.error('Profile API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const db = await connectDB();
        const userId = await resolveUserId(req);
        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const updateData: { email?: string; mobile?: string | null } = {};

        if (data.email !== undefined) {
            const [existingUser] = await db.select({ id: users.id }).from(users).where(and(eq(users.email, data.email), ne(users.id, userId))).limit(1);
            if (existingUser) {
                return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
            }
            updateData.email = data.email;
        }

        if (data.mobile !== undefined) {
            const [existingUser] = await db.select({ id: users.id }).from(users).where(and(eq(users.mobile, data.mobile), ne(users.id, userId))).limit(1);
            if (existingUser) {
                return NextResponse.json({ error: 'Mobile number already in use' }, { status: 400 });
            }
            updateData.mobile = data.mobile || null;
        }

        if (Object.keys(updateData).length > 0) {
            await db.update(users).set({ ...updateData, updatedAt: new Date() }).where(eq(users.id, userId));
        }

        const profileUpdate: { dob?: string; language?: string } = {};
        if (data.dob !== undefined) profileUpdate.dob = data.dob;
        if (data.language !== undefined) profileUpdate.language = data.language;

        if (Object.keys(profileUpdate).length > 0) {
            await db.insert(profiles).values({ userId, ...profileUpdate }).onConflictDoUpdate({
                target: profiles.userId,
                set: { ...profileUpdate, updatedAt: new Date() },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error: unknown) {
        console.error('Profile Update Error:', error);
        if (isUniqueViolation(error)) {
            return NextResponse.json({ error: 'Email or mobile number already in use' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
