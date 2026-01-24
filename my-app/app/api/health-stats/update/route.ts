import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { HealthStats } from '@/lib/models';
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
        const { points, streak } = body;

        const healthStats = await HealthStats.findOneAndUpdate(
            { userId },
            {
                $inc: { 
                    points: points || 0,
                    streak: streak || 0
                }
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({
            success: true,
            data: healthStats
        });
    } catch (error: unknown) {
        console.error('Update Health Stats Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
