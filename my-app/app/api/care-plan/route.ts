import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { CarePlan, MedicalRecord, Badge } from '@/lib/models';
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
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        const body = await req.json();

        const carePlan = await CarePlan.findOneAndUpdate(
            { userId },
            { $set: body },
            { new: true, upsert: true }
        );

        // Check for badge awards based on task completion
        if (body.dailyTasks && Array.isArray(body.dailyTasks)) {
            const completedTasks = body.dailyTasks.filter((t: any) => t.status === 'completed').length;
            
            // Award badge for completing 10 tasks
            if (completedTasks >= 10) {
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
                        metadata: { taskCount: completedTasks },
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
