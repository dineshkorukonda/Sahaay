import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User, Profile } from '@/lib/models';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function GET(req: Request) {
    try {
        await connectDB();
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        const [user, profile] = await Promise.all([
            User.findById(userId).select('name email mobile'),
            Profile.findOne({ userId })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                user,
                profile
            }
        });
    } catch (error: unknown) {
        console.error('Profile API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await connectDB();
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        const data = await req.json();
        const updateData: any = {};

        // Only allow updating email, mobile, dob, and language
        if (data.email !== undefined) {
            // Check if email already exists for another user
            const existingUser = await User.findOne({ email: data.email, _id: { $ne: userId } });
            if (existingUser) {
                return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
            }
            updateData.email = data.email;
        }

        if (data.mobile !== undefined) {
            // Check if mobile already exists for another user
            const existingUser = await User.findOne({ mobile: data.mobile, _id: { $ne: userId } });
            if (existingUser) {
                return NextResponse.json({ error: 'Mobile number already in use' }, { status: 400 });
            }
            updateData.mobile = data.mobile;
        }

        // Update user
        if (Object.keys(updateData).length > 0) {
            await User.findByIdAndUpdate(userId, { $set: updateData });
        }

        // Update profile
        const profileUpdate: any = {};
        if (data.dob !== undefined) {
            profileUpdate.dob = data.dob;
        }
        if (data.language !== undefined) {
            profileUpdate.language = data.language;
        }

        if (Object.keys(profileUpdate).length > 0) {
            await Profile.findOneAndUpdate(
                { userId },
                { $set: profileUpdate },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error: unknown) {
        console.error('Profile Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
