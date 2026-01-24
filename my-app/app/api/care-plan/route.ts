import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { CarePlan, MedicalRecord, Badge, HealthStats } from '@/lib/models';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function GET(req: Request) {
    try {
        await connectDB();
        
        // Support both Bearer token (mobile) and cookie (web)
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

        const carePlan = await CarePlan.findOne({ userId }).sort({ updatedAt: -1 });

        return NextResponse.json({
            success: true,
            data: carePlan
        });
    } catch (error: unknown) {
        console.error('Care Plan GET Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await connectDB();
        
        // Support both Bearer token (mobile) and cookie (web)
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

        const body = await req.json();

        // Get existing care plan before update
        const existingCarePlan = await CarePlan.findOne({ userId });
        const previousCompletedTasks = existingCarePlan?.dailyTasks?.filter((t: any) => t.status === 'completed') || [];

        const carePlan = await CarePlan.findOneAndUpdate(
            { userId },
            { $set: body },
            { new: true, upsert: true }
        );

        // Update streak and points when tasks are completed
        if (body.dailyTasks && Array.isArray(body.dailyTasks)) {
            const completedTasks = body.dailyTasks.filter((t: any) => t.status === 'completed');
            
            // Calculate newly completed tasks
            const newlyCompleted = completedTasks.length - previousCompletedTasks.length;
            
            if (newlyCompleted > 0) {
                // Get or create health stats
                let healthStats = await HealthStats.findOne({ userId });
                
                if (!healthStats) {
                    healthStats = await HealthStats.create({
                        userId,
                        streak: 0,
                        points: 0
                    });
                }
                
                // Award points for completed tasks (10 points per task)
                const pointsToAdd = newlyCompleted * 10;
                healthStats.points = (healthStats.points || 0) + pointsToAdd;
                
                // Update streak logic: increment if tasks were completed today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const lastUpdated = healthStats.lastUpdated ? new Date(healthStats.lastUpdated) : null;
                const lastUpdatedDate = lastUpdated ? new Date(lastUpdated.setHours(0, 0, 0, 0)) : null;
                
                if (!lastUpdatedDate || lastUpdatedDate.getTime() === today.getTime()) {
                    // Same day - maintain streak
                    // Streak is already correct
                } else {
                    // Check if yesterday
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    if (lastUpdatedDate.getTime() === yesterday.getTime()) {
                        // Consecutive day - increment streak
                        healthStats.streak = (healthStats.streak || 0) + 1;
                    } else {
                        // Streak broken - reset to 1
                        healthStats.streak = 1;
                    }
                }
                
                healthStats.lastUpdated = new Date();
                await healthStats.save();
            }
            
            // Award badge for completing 10 tasks
            if (completedTasks.length >= 10) {
                const existingBadge = await Badge.findOne({
                    userId,
                    badgeType: 'task_completion',
                    badgeName: 'Task Master'
                });
                
                if (!existingBadge) {
                    await Badge.create({
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
            data: carePlan
        });
    } catch (error: unknown) {
        console.error('Care Plan PUT Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
