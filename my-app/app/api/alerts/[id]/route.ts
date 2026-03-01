import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Alert } from '@/lib/models';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
        }

        const alert = await Alert.findByIdAndUpdate(
            id,
            { status: 'RESOLVED' },
            { new: true }
        );

        if (!alert) {
            return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, alert });
    } catch (error) {
        console.error('Alert PATCH error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
