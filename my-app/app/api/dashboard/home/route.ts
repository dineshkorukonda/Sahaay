import { NextResponse } from 'next/server';
import connectDB, { isUuid, withId } from '@/lib/db';
import { healthStats, medicalRecords, profiles, users } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { latestCarePlan } from '@/lib/queries';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function GET(req: Request) {
    try {
        const db = await connectDB();

        const authHeader = req.headers.get('authorization');
        let userId: string;

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { payload } = await jwtVerify(token, JWT_SECRET);
            userId = payload.userId as string;
        } else {
            const token = (await cookies()).get('token')?.value;
            if (!token) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const { payload } = await jwtVerify(token, JWT_SECRET);
            userId = payload.userId as string;
        }

        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [user, profile, records, statsRow, carePlan] = await Promise.all([
            db.select({
                id: users.id,
                name: users.name,
                mobile: users.mobile,
                email: users.email,
            }).from(users).where(eq(users.id, userId)).limit(1).then((rows) => rows[0] ?? null),
            db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1).then((rows) => rows[0] ?? null),
            db.select().from(medicalRecords).where(eq(medicalRecords.userId, userId)).orderBy(desc(medicalRecords.analyzedAt)).limit(5),
            db.select().from(healthStats).where(eq(healthStats.userId, userId)).limit(1).then((rows) => rows[0] ?? null),
            latestCarePlan(db, userId),
        ]);

        const stats = statsRow ? {
            streak: statsRow.streak || 0,
            points: statsRow.points || 0,
            vitals: {
                bp: statsRow.vitals?.bp || null,
                hr: statsRow.vitals?.hr || null
            }
        } : null;

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
                                type: apt.type || 'other',
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
                user: user ? withId(user) : null,
                profile: profile ? withId(profile) : null,
                records: records.map(withId),
                stats,
                actions
            }
        });
    } catch (error: unknown) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
