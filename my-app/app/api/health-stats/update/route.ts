import { NextResponse } from 'next/server';
import connectDB, { isUuid, withId } from '@/lib/db';
import { healthStats } from '@/lib/schema';
import { sql } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function POST(req: Request) {
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

        const body = await req.json();
        const pointsDelta = Number(body.points) || 0;
        const streakDelta = Number(body.streak) || 0;

        const [row] = await db.insert(healthStats).values({
            userId,
            points: pointsDelta,
            streak: streakDelta,
        }).onConflictDoUpdate({
            target: healthStats.userId,
            set: {
                points: sql`${healthStats.points} + ${pointsDelta}`,
                streak: sql`${healthStats.streak} + ${streakDelta}`,
                updatedAt: new Date(),
            },
        }).returning();

        return NextResponse.json({
            success: true,
            data: withId(row)
        });
    } catch (error: unknown) {
        console.error('Update Health Stats Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
