import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Badge } from '@/lib/models';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function POST(req: Request) {
    try {
        await connectDB();
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        const body = await req.json();
        const { badgeType, badgeName, description, icon, metadata } = body;

        // Check if badge already exists
        const existingBadge = await Badge.findOne({
            userId,
            badgeType,
            badgeName
        });

        if (existingBadge) {
            return NextResponse.json({
                success: true,
                data: existingBadge,
                message: 'Badge already earned'
            });
        }

        // Create new badge
        const badge = await Badge.create({
            userId,
            badgeType,
            badgeName,
            description,
            icon,
            metadata,
            earnedAt: new Date()
        });

        return NextResponse.json({
            success: true,
            data: badge,
            message: 'Badge awarded successfully'
        });
    } catch (error: unknown) {
        console.error('Award Badge Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
