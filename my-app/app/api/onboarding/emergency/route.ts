import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Profile } from '@/lib/models';
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

        const data = await req.json();

        // Update Profile with Health & Emergency info
        const profile = await Profile.findOneAndUpdate(
            { userId },
            {
                $set: {
                    bloodGroup: data.bloodGroup,
                    allergies: data.allergies,
                    chronicConditions: data.chronicConditions,
                    emergencyContact: data.emergencyContact
                }
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, profile });
    } catch (error: unknown) {
        console.error('Emergency API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
