import { NextResponse } from 'next/server';
import connectDB, { isUuid, withId } from '@/lib/db';
import { waterQualityReports, type LocationJson } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const db = await connectDB();
        const url = new URL(req.url);
        const pinCode = url.searchParams.get('pinCode');
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);

        const query = db.select().from(waterQualityReports).orderBy(desc(waterQualityReports.reportedAt)).limit(limit);
        const reports = pinCode
            ? await db.select().from(waterQualityReports).where(eq(waterQualityReports.pinCode, pinCode)).orderBy(desc(waterQualityReports.reportedAt)).limit(limit)
            : await query;

        return NextResponse.json({ success: true, reports: reports.map(withId) });
    } catch (error) {
        console.error('Water quality GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const db = await connectDB();
        const userId = await getUserIdFromRequest(req);
        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { pinCode, location, source, turbidity, pH, bacterialPresence, notes } = body;

        if (!source || !turbidity || pH == null || !bacterialPresence) {
            return NextResponse.json(
                { error: 'Missing required fields: source, turbidity, pH, bacterialPresence' },
                { status: 400 }
            );
        }

        const validSources = ['hand_pump', 'well', 'tap', 'pond', 'other'];
        const validTurbidity = ['low', 'medium', 'high'];
        const validBacterial = ['pass', 'fail', 'unknown'];
        if (!validSources.includes(source) || !validTurbidity.includes(turbidity) || !validBacterial.includes(bacterialPresence)) {
            return NextResponse.json({ error: 'Invalid enum value for source, turbidity, or bacterialPresence' }, { status: 400 });
        }

        const [report] = await db.insert(waterQualityReports).values({
            userId,
            pinCode: pinCode || null,
            location: (location || null) as LocationJson | null,
            source,
            turbidity,
            pH: Number(pH),
            bacterialPresence,
            notes: notes || null,
        }).returning();

        return NextResponse.json({ success: true, report: withId(report) });
    } catch (error) {
        console.error('Water quality POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
