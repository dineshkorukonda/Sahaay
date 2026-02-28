import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { name, mobile, email, password } = await req.json();

        // Email is now required, mobile is optional
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        // Check if user with email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        // If mobile is provided, check if it's already taken
        if (mobile) {
            const existingMobileUser = await User.findOne({ mobile });
            if (existingMobileUser) {
                return NextResponse.json({ error: 'User with this mobile number already exists' }, { status: 409 });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user (no OTP verification)
        const newUser = await User.create({
            name,
            mobile: mobile || undefined,
            email,
            password: hashedPassword,
            isEmailVerified: true,
        });

        return NextResponse.json({
            success: true,
            message: 'Account created. You can log in now.',
            userId: newUser._id.toString(),
            email: newUser.email
        }, { status: 201 });

    } catch (error: unknown) {
        console.error('Signup Error:', error);
        
        // Handle duplicate key errors
        if (error instanceof Error && error.message.includes('duplicate key')) {
            return NextResponse.json({ error: 'Email or mobile number already exists' }, { status: 409 });
        }
        
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
