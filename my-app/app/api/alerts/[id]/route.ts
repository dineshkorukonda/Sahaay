import { NextResponse } from 'next/server';
import connectDB, { isUuid, withId } from '@/lib/db';
import { alerts } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const db = await connectDB();

        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!isUuid(id)) {
            return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
        }

        const [alert] = await db.update(alerts).set({
            status: 'RESOLVED',
            updatedAt: new Date(),
        }).where(eq(alerts.id, id)).returning();

        if (!alert) {
            return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, alert: withId(alert) });
    } catch (error) {
        console.error('Alert PATCH error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
