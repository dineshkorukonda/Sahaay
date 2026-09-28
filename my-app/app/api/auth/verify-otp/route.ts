import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { profiles, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function POST(req: Request) {
    try {
        const db = await connectDB();
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.otp !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        if (!user.otpExpires || user.otpExpires < new Date()) {
            return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
        }

        await db.update(users).set({
            isEmailVerified: true,
            otp: null,
            otpExpires: null,
            updatedAt: new Date(),
        }).where(eq(users.id, user.id));

        const token = await new SignJWT({
            userId: user.id,
            email: user.email
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        (await cookies()).set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
        const hasCompletedOnboarding = !!profile &&
            !!profile.dob &&
            !!profile.location?.pinCode &&
            !!profile.emergencyContact;

        const isMobileRequest = req.headers.get('x-client-type') === 'mobile' ||
                                req.headers.get('authorization') !== null;

        const responseData: Record<string, unknown> = {
            success: true,
            message: 'Email verified successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile
            },
            hasCompletedOnboarding
        };

        if (isMobileRequest) {
            responseData.token = token;
        }

        return NextResponse.json(responseData, { status: 200 });

    } catch (error: unknown) {
        console.error('OTP Verification Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
