import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Alert } from '@/lib/models';

export async function GET() {
    try {
        await connectDB();

        const alerts = await Alert.find({ status: 'ACTIVE' })
            .sort({ triggeredAt: -1 })
            .lean();

        return NextResponse.json({ success: true, alerts });
    } catch (error) {
        console.error('Alerts GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
