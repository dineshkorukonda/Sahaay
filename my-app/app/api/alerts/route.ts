import { NextResponse } from 'next/server';
import connectDB, { withId } from '@/lib/db';
import { alerts } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
    try {
        const db = await connectDB();

        const rows = await db.select().from(alerts).where(eq(alerts.status, 'ACTIVE')).orderBy(desc(alerts.triggeredAt));

        return NextResponse.json({ success: true, alerts: rows.map(withId) });
    } catch (error) {
        console.error('Alerts GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
