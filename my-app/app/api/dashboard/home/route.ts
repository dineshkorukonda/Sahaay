import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User, Profile, MedicalRecord } from '@/lib/models';
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

        const [user, profile, records] = await Promise.all([
            User.findById(userId).select('name mobile email'),
            Profile.findOne({ userId }),
            MedicalRecord.find({ userId }).sort({ analyzedAt: -1 }).limit(5)
        ]);

        // Mock Stats for the dashboard (Streak, Points - typically would be in another model)
        const stats = {
            streak: 7, // mock
            points: 1250, // mock
            vitals: {
                bp: "120/80",
                hr: "72"
            }
        };

        // Mock Actions
        const actions = [
            { id: 1, title: "Lisinopril - 10mg", type: "medication", time: "08:00 AM", status: "pending" },
            { id: 2, title: "Daily Symptom Check", type: "checkup", status: "pending" }
        ];

        return NextResponse.json({
            success: true,
            data: {
                user,
                profile,
                records,
                stats,
                actions
            }
        });
    } catch (error: unknown) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
