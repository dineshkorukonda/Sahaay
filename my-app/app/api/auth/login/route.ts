import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { profiles, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function POST(req: Request) {
    try {
        const db = await connectDB();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
            [user] = await db.select().from(users).where(eq(users.mobile, email)).limit(1);
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

        const token = await new SignJWT({
            userId: user.id,
            email: user.email || user.mobile
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

        console.log('Login Debug:', {
            email: user.email,
            userId: user.id,
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

        const isMobileRequest = req.headers.get('x-client-type') === 'mobile' ||
                                req.headers.get('authorization') !== null;

        const responseData: Record<string, unknown> = {
            success: true,
            user: {
                id: user.id,
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

        if (isMobileRequest) {
            responseData.token = token;
        }

        return NextResponse.json(responseData, { status: 200 });

    } catch (error: unknown) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
