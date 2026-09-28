import { NextResponse } from 'next/server';
import connectDB, { isUuid } from '@/lib/db';
import { communityGroupMembers, communityGroups } from '@/lib/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

async function getUserId(req: Request): Promise<string | null> {
    try {
        const authHeader = req.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { payload } = await jwtVerify(token, JWT_SECRET);
            return payload.userId as string;
        } else {
            const token = (await cookies()).get('token')?.value;
            if (!token) return null;
            const { payload } = await jwtVerify(token, JWT_SECRET);
            return payload.userId as string;
        }
    } catch {
        return null;
    }
}

export async function GET(_req: Request) {
    try {
        const db = await connectDB();

        const groups = await db.select({
            id: communityGroups.id,
            name: communityGroups.name,
            description: communityGroups.description,
            image: communityGroups.image,
            tags: communityGroups.tags,
            members: sql<number>`count(${communityGroupMembers.userId})::int`,
        }).from(communityGroups)
            .leftJoin(communityGroupMembers, eq(communityGroups.id, communityGroupMembers.groupId))
            .groupBy(communityGroups.id)
            .orderBy(desc(sql`count(${communityGroupMembers.userId})`));

        const formattedGroups = groups.map((group) => ({
            id: group.id,
            name: group.name,
            description: group.description,
            image: group.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
            members: Number(group.members) || 0,
            tags: group.tags || []
        }));

        return NextResponse.json({
            success: true,
            groups: formattedGroups
        });
    } catch (error: unknown) {
        console.error('Community Groups GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const db = await connectDB();

        const userId = await getUserId(req);
        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { groupId, name, description, image, tags } = await req.json();

        if (groupId) {
            if (!isUuid(groupId)) {
                return NextResponse.json({ error: 'Group not found' }, { status: 404 });
            }

            const [group] = await db.select().from(communityGroups).where(eq(communityGroups.id, groupId)).limit(1);
            if (!group) {
                return NextResponse.json({ error: 'Group not found' }, { status: 404 });
            }

            await db.insert(communityGroupMembers).values({ groupId, userId }).onConflictDoNothing();

            const [countRow] = await db.select({
                members: sql<number>`count(*)::int`,
            }).from(communityGroupMembers).where(eq(communityGroupMembers.groupId, groupId));

            return NextResponse.json({
                success: true,
                message: 'Joined group successfully',
                group: {
                    id: group.id,
                    name: group.name,
                    members: Number(countRow?.members) || 0
                }
            });
        }

        if (!name || !description) {
            return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
        }

        const [group] = await db.insert(communityGroups).values({
            name,
            description,
            image,
            tags: tags || [],
            createdBy: userId,
        }).returning();

        await db.insert(communityGroupMembers).values({ groupId: group.id, userId });

        return NextResponse.json({
            success: true,
            group: {
                id: group.id,
                name: group.name,
                description: group.description,
                image: group.image,
                members: 1,
                tags: group.tags
            }
        });
    } catch (error: unknown) {
        console.error('Community Groups POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
