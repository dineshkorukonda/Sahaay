import { NextResponse } from 'next/server';
import connectDB, { isUuid } from '@/lib/db';
import { familyMembers } from '@/lib/schema';
import { and, eq } from 'drizzle-orm';
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
        const db = await connectDB();

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

        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: memberId } = await params;
        if (!isUuid(memberId)) {
            return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
        }

        const [member] = await db.select({ id: familyMembers.id }).from(familyMembers).where(and(eq(familyMembers.id, memberId), eq(familyMembers.userId, userId))).limit(1);
        if (!member) {
            return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
        }

        await db.delete(familyMembers).where(eq(familyMembers.id, memberId));

        return NextResponse.json({
            success: true,
            message: 'Family member removed successfully'
        });
    } catch (error: unknown) {
        console.error('Family Delete Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
