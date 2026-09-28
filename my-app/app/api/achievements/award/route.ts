export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import connectDB, { isUuid, withId } from '@/lib/db';
import { badges } from '@/lib/schema';
import { and, eq } from 'drizzle-orm';
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
        const { badgeType, badgeName, description, icon, metadata } = body;

        const [existingBadge] = await db.select().from(badges).where(and(
            eq(badges.userId, userId),
            eq(badges.badgeType, badgeType),
            eq(badges.badgeName, badgeName),
        )).limit(1);

        if (existingBadge) {
            return NextResponse.json({
                success: true,
                data: withId(existingBadge),
                message: 'Badge already earned'
            });
        }

        const [badge] = await db.insert(badges).values({
            userId,
            badgeType,
            badgeName,
            description,
            icon,
            metadata,
            earnedAt: new Date()
        }).returning();

        return NextResponse.json({
            success: true,
            data: withId(badge),
            message: 'Badge awarded successfully'
        });
    } catch (error: unknown) {
        console.error('Award Badge Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
