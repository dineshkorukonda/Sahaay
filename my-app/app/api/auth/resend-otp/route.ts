import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendOTPEmail } from '@/lib/email';

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
    try {
        const db = await connectDB();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.isEmailVerified) {
            return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        await db.update(users).set({
            otp,
            otpExpires,
            updatedAt: new Date(),
        }).where(eq(users.id, user.id));

        try {
            await sendOTPEmail(email, otp);
        } catch (emailError) {
            console.error('Failed to send OTP email:', emailError);
            return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'OTP has been resent to your email'
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Resend OTP Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
