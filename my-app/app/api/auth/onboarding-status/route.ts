import { NextResponse } from 'next/server';
import connectDB, { isUuid } from '@/lib/db';
import { profiles } from '@/lib/schema';
import { eq } from 'drizzle-orm';
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

        const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

        const hasCompletedOnboarding = !!profile &&
            !!profile.dob &&
            !!profile.location?.pinCode &&
            !!profile.emergencyContact;

        return NextResponse.json({
            success: true,
            hasCompletedOnboarding,
            profile: profile ? {
                dob: profile.dob,
                hasLocation: !!profile.location?.pinCode,
                hasEmergencyContact: !!profile.emergencyContact
            } : null
        });
    } catch (error: unknown) {
        console.error('Onboarding Status Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
