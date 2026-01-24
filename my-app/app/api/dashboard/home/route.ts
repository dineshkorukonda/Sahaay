import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { User, Profile, MedicalRecord, HealthStats, CarePlan } from '@/lib/models';
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

        const [user, profile, records, healthStats, carePlan] = await Promise.all([
            User.findById(userId).select('name mobile email'),
            Profile.findOne({ userId }),
            MedicalRecord.find({ userId }).sort({ analyzedAt: -1 }).limit(5),
            HealthStats.findOne({ userId }),
            CarePlan.findOne({ userId }).sort({ updatedAt: -1 })
        ]);

        // Use real stats or return null if no data
        const stats = healthStats ? {
            streak: healthStats.streak || 0,
            points: healthStats.points || 0,
            vitals: {
                bp: healthStats.vitals?.bp || null,
                hr: healthStats.vitals?.hr || null
            }
        } : null;

        // Get actions from care plan only (no dummy data)
        const actions: Array<{
            id: string;
            title: string;
            type: string;
            time: string;
            status: string;
            dosage?: string;
            frequency?: string;
        }> = [];
        if (carePlan) {
            if (carePlan.medications) {
                carePlan.medications.forEach((med, index) => {
                    if (med.status === 'pending') {
                        actions.push({
                            id: `med-${index}`,
                            title: med.name,
                            type: "medication",
                            time: med.time || "08:00 AM",
                            status: med.status,
                            dosage: med.dosage,
                            frequency: med.frequency
                        });
                    }
                });
            }
            if (carePlan.checkups) {
                carePlan.checkups.forEach((checkup, index) => {
                    if (checkup.status === 'pending') {
                        actions.push({
                            id: `checkup-${index}`,
                            title: checkup.title,
                            type: "checkup",
                            time: checkup.time || "10:00 AM",
                            status: checkup.status
                        });
                    }
                });
            }
            // Add today's appointments from weekly schedule
            if (carePlan.weeklySchedule) {
                const today = new Date();
                const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
                const daySchedule = carePlan.weeklySchedule.find(s => s.day === dayName);
                if (daySchedule && daySchedule.appointments) {
                    daySchedule.appointments.forEach((apt, index) => {
                        if (apt.status === 'pending') {
                            actions.push({
                                id: `apt-${index}`,
                                title: apt.title,
                                type: apt.type,
                                time: apt.time,
                                status: apt.status || 'pending'
                            });
                        }
                    });
                }
            }
        }

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
