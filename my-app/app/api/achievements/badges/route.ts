import { NextResponse } from 'next/server';
import connectDB, { isUuid, withId } from '@/lib/db';
import { badges } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function GET(_req: Request) {
    try {
        const db = await connectDB();
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;
        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rows = await db.select().from(badges).where(eq(badges.userId, userId)).orderBy(desc(badges.earnedAt));

        return NextResponse.json({
            success: true,
            data: rows.map(withId)
        });
    } catch (error: unknown) {
        console.error('Badges GET Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
