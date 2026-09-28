import { NextResponse } from 'next/server';
import connectDB, { isUuid, withId } from '@/lib/db';
import { profiles, type LocationJson } from '@/lib/schema';
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
        const values: {
            userId: string;
            dob?: string;
            gender?: string;
            pinCode?: string;
            location?: LocationJson;
        } = { userId };

        if (data.dob !== undefined) values.dob = data.dob;
        if (data.gender !== undefined) values.gender = data.gender;
        if (data.pinCode !== undefined) values.pinCode = data.pinCode;

        if (data.location) {
            values.location = {
                pinCode: data.location.pinCode || data.pinCode,
                city: data.location.city,
                state: data.location.state,
                latitude: data.location.latitude,
                longitude: data.location.longitude
            };
        }

        const [profile] = await db.insert(profiles).values(values).onConflictDoUpdate({
            target: profiles.userId,
            set: { ...values, updatedAt: new Date() },
        }).returning();

        console.log('Profile updated:', {
            userId,
            hasLocation: !!profile?.location?.pinCode,
            locationPinCode: profile?.location?.pinCode,
            updateData: values
        });

        return NextResponse.json({ success: true, profile: withId(profile) });
    } catch (error: unknown) {
        console.error('Profile API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
