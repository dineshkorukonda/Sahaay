import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User, Profile } from '@/lib/models';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if OTP matches
        if (user.otp !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        // Check if OTP has expired
        if (!user.otpExpires || user.otpExpires < new Date()) {
            return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }

        // Verify email and clear OTP
        user.isEmailVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Create JWT
        const token = await new SignJWT({ 
            userId: user._id.toString(), 
            email: user.email 
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        // Set Cookie
        (await cookies()).set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        // Check if user has completed onboarding (has a profile with essential data)
        const profile = await Profile.findOne({ userId: user._id });
        const hasCompletedOnboarding = !!profile && 
            !!profile.dob && 
            !!profile.location?.pinCode && 
            !!profile.emergencyContact;

        return NextResponse.json({ 
            success: true, 
            message: 'Email verified successfully',
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                mobile: user.mobile 
            },
            hasCompletedOnboarding
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('OTP Verification Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
