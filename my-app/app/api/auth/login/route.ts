import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User, Profile } from '@/lib/models';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Try to find user by email first, then by mobile if email doesn't match
        let user = await User.findOne({ email });
        if (!user) {
            // Try mobile as fallback
            user = await User.findOne({ mobile: email });
        }

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (!user.password) {
            return NextResponse.json({ error: 'Invalid credentials - Please login with correct method' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create JWT
        const token = await new SignJWT({ 
            userId: user._id.toString(), 
            email: user.email || user.mobile 
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

        // Add detailed logging for debugging
        console.log('Login Debug:', {
            email: user.email,
            userId: user._id.toString(),
            hasProfile: !!profile,
            profileData: profile ? {
                dob: profile.dob,
                hasLocation: !!profile.location?.pinCode,
                locationPinCode: profile.location?.pinCode,
                hasEmergencyContact: !!profile.emergencyContact,
                emergencyContact: profile.emergencyContact
            } : null,
            hasCompletedOnboarding
        });

        // Check if request is from mobile (has Authorization header or specific header)
        const isMobileRequest = req.headers.get('x-client-type') === 'mobile' || 
                                req.headers.get('authorization') !== null;

        const responseData: Record<string, unknown> = { 
            success: true, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email,
                mobile: user.mobile 
            },
            hasCompletedOnboarding,
            debug: {
                hasProfile: !!profile,
                profileCheck: {
                    dob: !!profile?.dob,
                    location: !!profile?.location?.pinCode,
                    emergencyContact: !!profile?.emergencyContact
                }
            }
        };

        // Return token in response body for mobile apps
        if (isMobileRequest) {
            responseData.token = token;
        }

        return NextResponse.json(responseData, { status: 200 });

    } catch (error: unknown) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
