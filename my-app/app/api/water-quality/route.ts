import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { WaterQualityReport } from '@/lib/models';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const pinCode = url.searchParams.get('pinCode');
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);

        const filter: Record<string, unknown> = {};
        if (pinCode) filter.pinCode = pinCode;

        const reports = await WaterQualityReport.find(filter)
            .sort({ reportedAt: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json({ success: true, reports });
    } catch (error) {
        console.error('Water quality GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
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

        const report = await WaterQualityReport.create({
            userId,
            pinCode: pinCode || undefined,
            location: location || undefined,
            source,
            turbidity,
            pH: Number(pH),
            bacterialPresence,
            notes: notes || undefined
        });

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error('Water quality POST error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
