import { NextResponse } from 'next/server';
import connectDB, { isUuid, withId } from '@/lib/db';
import { badges, carePlans, healthStats } from '@/lib/schema';
import { and, eq } from 'drizzle-orm';
import { latestCarePlan } from '@/lib/queries';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

async function resolveUserId(req: Request): Promise<string | null> {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.userId as string;
    }
    const token = (await cookies()).get('token')?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
}

function carePlanFields(body: Record<string, unknown>) {
    const patch: Partial<typeof carePlans.$inferInsert> = {};
    if (typeof body.title === 'string') patch.title = body.title;
    if (body.description !== undefined) patch.description = body.description as string | null;
    if (body.problem !== undefined) patch.problem = body.problem as string | null;
    if (body.medications !== undefined) patch.medications = body.medications as typeof patch.medications;
    if (body.checkups !== undefined) patch.checkups = body.checkups as typeof patch.checkups;
    if (body.dietPlan !== undefined) patch.dietPlan = body.dietPlan as typeof patch.dietPlan;
    if (body.exercisePlan !== undefined) patch.exercisePlan = body.exercisePlan as typeof patch.exercisePlan;
    if (body.dailyTasks !== undefined) patch.dailyTasks = body.dailyTasks as typeof patch.dailyTasks;
    if (body.weeklySchedule !== undefined) patch.weeklySchedule = body.weeklySchedule as typeof patch.weeklySchedule;
    return patch;
}

export async function GET(req: Request) {
    try {
        const db = await connectDB();
        const userId = await resolveUserId(req);
        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const carePlan = await latestCarePlan(db, userId);

        return NextResponse.json({
            success: true,
            data: carePlan ? withId(carePlan) : null
        });
    } catch (error: unknown) {
        console.error('Care Plan GET Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const db = await connectDB();
        const userId = await resolveUserId(req);
        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json() as Record<string, unknown>;
        const existingCarePlan = await latestCarePlan(db, userId);
        const previousCompletedTasks = existingCarePlan?.dailyTasks?.filter((t) => t.status === 'completed') || [];
        const fields = carePlanFields(body);

        let carePlan;
        if (existingCarePlan) {
            const [updated] = await db.update(carePlans).set({
                ...fields,
                updatedAt: new Date(),
            }).where(eq(carePlans.id, existingCarePlan.id)).returning();
            carePlan = updated;
        } else {
            const [created] = await db.insert(carePlans).values({
                userId,
                title: typeof body.title === 'string' && body.title ? body.title : 'Care Plan',
                ...fields,
            }).returning();
            carePlan = created;
        }

        if (body.dailyTasks && Array.isArray(body.dailyTasks)) {
            const completedTasks = body.dailyTasks.filter((t: { status?: string }) => t.status === 'completed');
            const newlyCompleted = completedTasks.length - previousCompletedTasks.length;

            if (newlyCompleted > 0) {
                let [stats] = await db.select().from(healthStats).where(eq(healthStats.userId, userId)).limit(1);

                if (!stats) {
                    const [created] = await db.insert(healthStats).values({
                        userId,
                        streak: 0,
                        points: 0
                    }).returning();
                    stats = created;
                }

                const pointsToAdd = newlyCompleted * 10;
                let streak = stats.streak || 0;

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const lastUpdated = stats.lastUpdated ? new Date(stats.lastUpdated) : null;
                const lastUpdatedDate = lastUpdated ? new Date(lastUpdated.setHours(0, 0, 0, 0)) : null;

                if (!lastUpdatedDate || lastUpdatedDate.getTime() === today.getTime()) {
                    // Same day - maintain streak
                } else {
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);

                    if (lastUpdatedDate.getTime() === yesterday.getTime()) {
                        streak = (stats.streak || 0) + 1;
                    } else {
                        streak = 1;
                    }
                }

                await db.update(healthStats).set({
                    points: (stats.points || 0) + pointsToAdd,
                    streak,
                    lastUpdated: new Date(),
                    updatedAt: new Date(),
                }).where(eq(healthStats.id, stats.id));
            }

            if (completedTasks.length >= 10) {
                const [existingBadge] = await db.select({ id: badges.id }).from(badges).where(and(
                    eq(badges.userId, userId),
                    eq(badges.badgeType, 'task_completion'),
                    eq(badges.badgeName, 'Task Master'),
                )).limit(1);

                if (!existingBadge) {
                    await db.insert(badges).values({
                        userId,
                        badgeType: 'task_completion',
                        badgeName: 'Task Master',
                        description: 'Completed 10 daily tasks',
                        icon: '✅',
                        metadata: { taskCount: completedTasks.length },
                        earnedAt: new Date()
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            data: withId(carePlan)
        });
    } catch (error: unknown) {
        console.error('Care Plan PUT Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
