import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { FamilyMember } from '@/lib/models';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        // Await params in Next.js 16+
        const { id } = await params;
        const memberId = id;

        // Verify the member belongs to the user
        const member = await FamilyMember.findOne({ _id: memberId, userId });
        if (!member) {
            return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
        }

        await FamilyMember.findByIdAndDelete(memberId);

        return NextResponse.json({
            success: true,
            message: 'Family member removed successfully'
        });
    } catch (error: unknown) {
        console.error('Family Delete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
