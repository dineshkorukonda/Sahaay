import { NextResponse } from 'next/server';
import connectDB, { isUniqueViolation } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const db = await connectDB();
        const { name, mobile, email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        if (mobile) {
            const [existingMobileUser] = await db.select({ id: users.id }).from(users).where(eq(users.mobile, mobile)).limit(1);
            if (existingMobileUser) {
                return NextResponse.json({ error: 'User with this mobile number already exists' }, { status: 409 });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [newUser] = await db.insert(users).values({
            name,
            mobile: mobile || null,
            email,
            password: hashedPassword,
            isEmailVerified: true,
        }).returning();

        return NextResponse.json({
            success: true,
            message: 'Account created. You can log in now.',
            userId: newUser.id,
            email: newUser.email
        }, { status: 201 });

    } catch (error: unknown) {
        console.error('Signup Error:', error);

        if (isUniqueViolation(error)) {
            return NextResponse.json({ error: 'Email or mobile number already exists' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
