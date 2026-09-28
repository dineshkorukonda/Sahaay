import { NextResponse } from 'next/server';
import connectDB, { isUuid } from '@/lib/db';
import { healthStats } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { latestCarePlan } from '@/lib/queries';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function GET(_req: Request) {
    try {
        const db = await connectDB();
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;
        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [carePlan, statsRow] = await Promise.all([
            latestCarePlan(db, userId),
            db.select().from(healthStats).where(eq(healthStats.userId, userId)).limit(1).then((rows) => rows[0] ?? null),
        ]);

        const milestones = [];

        if (carePlan && carePlan.dailyTasks) {
            const completedTasks = carePlan.dailyTasks.filter(t => t.status === 'completed').length;
            const totalTasks = carePlan.dailyTasks.length;
            milestones.push({
                title: 'Task Master',
                description: 'Complete daily tasks consistently',
                progress: completedTasks,
                target: Math.max(10, totalTasks),
                icon: '✅',
                category: 'tasks'
            });
        }

        if (statsRow) {
            milestones.push({
                title: 'Consistency Champion',
                description: 'Maintain your health streak',
                progress: statsRow.streak || 0,
                target: 30,
                icon: '🔥',
                category: 'streak'
            });

            milestones.push({
                title: 'Health Points Collector',
                description: 'Earn health points through activities',
                progress: statsRow.points || 0,
                target: 1000,
                icon: '⭐',
                category: 'points'
            });
        }

        if (carePlan && carePlan.medications) {
            const completedMeds = carePlan.medications.filter(m => m.status === 'completed').length;
            const totalMeds = carePlan.medications.length;
            if (totalMeds > 0) {
                milestones.push({
                    title: 'Medication Adherence',
                    description: 'Take medications as prescribed',
                    progress: completedMeds,
                    target: totalMeds * 7,
                    icon: '💊',
                    category: 'medication'
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: milestones
        });
    } catch (error: unknown) {
        console.error('Milestones GET Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
