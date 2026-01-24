import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { CarePlan, HealthStats } from '@/lib/models';
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

        const [carePlan, healthStats] = await Promise.all([
            CarePlan.findOne({ userId }),
            HealthStats.findOne({ userId })
        ]);

        const milestones = [];

        // Task completion milestone
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

        // Streak milestone
        if (healthStats) {
            milestones.push({
                title: 'Consistency Champion',
                description: 'Maintain your health streak',
                progress: healthStats.streak || 0,
                target: 30,
                icon: '🔥',
                category: 'streak'
            });

            // Points milestone
            milestones.push({
                title: 'Health Points Collector',
                description: 'Earn health points through activities',
                progress: healthStats.points || 0,
                target: 1000,
                icon: '⭐',
                category: 'points'
            });
        }

        // Medication adherence milestone
        if (carePlan && carePlan.medications) {
            const completedMeds = carePlan.medications.filter(m => m.status === 'completed').length;
            const totalMeds = carePlan.medications.length;
            if (totalMeds > 0) {
                milestones.push({
                    title: 'Medication Adherence',
                    description: 'Take medications as prescribed',
                    progress: completedMeds,
                    target: totalMeds * 7, // 7 days of adherence
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
