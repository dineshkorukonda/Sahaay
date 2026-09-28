import { NextResponse } from 'next/server';
import connectDB, { isUuid, withId } from '@/lib/db';
import { familyMembers } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

function parseAge(age: unknown): number | null {
    if (age === '' || age == null) return null;
    const n = Number(age);
    return Number.isFinite(n) ? Math.trunc(n) : null;
}

async function resolveUserId(req: Request): Promise<string | null> {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.userId as string;
    }
    const token = (await cookies()).get('token')?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.userId as string;
}

export async function POST(req: Request) {
    try {
        const db = await connectDB();
        const userId = await resolveUserId(req);
        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, relationship, age, email, phone, emergencyAccess } = await req.json();

        if (!name || !relationship) {
            return NextResponse.json({ error: 'Name and relationship are required' }, { status: 400 });
        }

        const [familyMember] = await db.insert(familyMembers).values({
            userId,
            name,
            relationship,
            age: parseAge(age),
            email: email || null,
            phone: phone || null,
            emergencyAccess: !!emergencyAccess,
        }).returning();

        return NextResponse.json({
            success: true,
            message: "Family member added successfully",
            familyMember: withId(familyMember)
        });

    } catch (error: unknown) {
        console.error('Family API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const db = await connectDB();
        const userId = await resolveUserId(req);
        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rows = await db.select().from(familyMembers).where(eq(familyMembers.userId, userId)).orderBy(desc(familyMembers.createdAt));

        return NextResponse.json({
            success: true,
            family: rows.map(member => ({
                id: member.id,
                _id: member.id,
                name: member.name,
                relationship: member.relationship,
                age: member.age,
                email: member.email,
                phone: member.phone,
                status: member.status,
                adherence: member.adherence,
                emergencyAccess: member.emergencyAccess,
                image: member.image
            }))
        });
    } catch (error: unknown) {
        console.error('Family GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
