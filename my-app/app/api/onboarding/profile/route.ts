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
        
        // Support both Bearer token (mobile) and cookie (web)
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

        const data = await req.json();

        // Build update object dynamically
        const updateData: any = {};
        
        if (data.dob !== undefined) updateData.dob = data.dob;
        if (data.gender !== undefined) updateData.gender = data.gender;
        if (data.pinCode !== undefined) updateData.pinCode = data.pinCode;
        
        // Handle location data
        if (data.location) {
            updateData.location = {
                pinCode: data.location.pinCode || data.pinCode,
                city: data.location.city,
                state: data.location.state,
                latitude: data.location.latitude,
                longitude: data.location.longitude
            };
        }

        // Upsert Profile
        const profile = await Profile.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { new: true, upsert: true }
        );

        console.log('Profile updated:', {
            userId,
            hasLocation: !!profile?.location?.pinCode,
            locationPinCode: profile?.location?.pinCode,
            updateData
        });

        return NextResponse.json({ success: true, profile });
    } catch (error: unknown) {
        console.error('Profile API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
