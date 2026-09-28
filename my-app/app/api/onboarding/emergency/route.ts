import { NextResponse } from 'next/server';
import connectDB, { isUuid, withId } from '@/lib/db';
import { profiles, type EmergencyContactJson } from '@/lib/schema';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function POST(req: Request) {
    try {
        const db = await connectDB();

        const authHeader = req.headers.get('authorization');
        let userId: string;

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { payload } = await jwtVerify(token, JWT_SECRET);
            userId = payload.userId as string;
        } else {
            const token = (await cookies()).get('token')?.value;
            if (!token) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const { payload } = await jwtVerify(token, JWT_SECRET);
            userId = payload.userId as string;
        }

        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        const emergencyContact = data.emergencyContact as EmergencyContactJson | undefined;

        const [profile] = await db.insert(profiles).values({
            userId,
            bloodGroup: data.bloodGroup,
            allergies: data.allergies,
            chronicConditions: data.chronicConditions,
            emergencyContact,
        }).onConflictDoUpdate({
            target: profiles.userId,
            set: {
                bloodGroup: data.bloodGroup,
                allergies: data.allergies,
                chronicConditions: data.chronicConditions,
                emergencyContact,
                updatedAt: new Date(),
            },
        }).returning();

        return NextResponse.json({ success: true, profile: withId(profile) });
    } catch (error: unknown) {
        console.error('Emergency API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
