import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { FamilyMember } from '@/lib/models';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function POST(req: Request) {
    try {
        await connectDB();
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        const { name, relationship, age, email, phone, emergencyAccess } = await req.json();

        if (!name || !relationship) {
            return NextResponse.json({ error: 'Name and relationship are required' }, { status: 400 });
        }

        const familyMember = await FamilyMember.create({
            userId,
            name,
            relationship,
            age,
            email,
            phone,
            emergencyAccess: emergencyAccess || false,
            status: 'STABLE',
            adherence: 100
        });

        return NextResponse.json({ 
            success: true, 
            message: "Family member added successfully",
            familyMember 
        });

    } catch (error: unknown) {
        console.error('Family API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await connectDB();
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        const familyMembers = await FamilyMember.find({ userId }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            family: familyMembers.map(member => ({
                id: member._id,
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
