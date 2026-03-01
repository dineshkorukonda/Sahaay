import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { CommunityGroup } from '@/lib/models';
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

// Get all groups
export async function GET(_req: Request) {
    try {
        await connectDB();

        const groups = await CommunityGroup.find()
            .sort({ members: -1 })
            .populate('createdBy', 'name')
            .lean();
        const formattedGroups = groups.map((group: any) => ({
            id: group._id.toString(),
            name: group.name,
            description: group.description,
            image: group.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
            members: group.members?.length || 0,
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

// Create a group or join a group
export async function POST(req: Request) {
    try {
        await connectDB();

        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { groupId, name, description, image, tags } = await req.json();

        // If groupId provided, join existing group
        if (groupId) {
            const group = await CommunityGroup.findById(groupId);
            if (!group) {
                return NextResponse.json({ error: 'Group not found' }, { status: 404 });
            }

            const isMember = group.members.some((memberId: unknown) => String(memberId) === userId);
            if (!isMember) {
                group.members.push(userId as any);
                await group.save();
            }

            return NextResponse.json({
                success: true,
                message: 'Joined group successfully',
                group: {
                    id: group._id.toString(),
                    name: group.name,
                    members: group.members.length
                }
            });
        }

        // Create new group
        if (!name || !description) {
            return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
        }

        const group = await CommunityGroup.create({
            name,
            description,
            image,
            tags: tags || [],
            members: [userId],
            createdBy: userId
        });

        return NextResponse.json({
            success: true,
            group: {
                id: group._id.toString(),
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
