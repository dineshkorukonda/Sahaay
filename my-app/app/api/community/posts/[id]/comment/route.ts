import { NextResponse } from 'next/server';
import connectDB, { isUuid } from '@/lib/db';
import { communityComments, communityPosts, users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
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

function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const db = await connectDB();

        const userId = await getUserId(req);
        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { id } = await params;
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        if (!isUuid(id)) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const [post] = await db.select({ id: communityPosts.id }).from(communityPosts).where(eq(communityPosts.id, id)).limit(1);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const [comment] = await db.insert(communityComments).values({
            postId: id,
            userId,
            author: user.name || user.email.split('@')[0],
            avatar: user.name ? user.name.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase(),
            content
        }).returning();

        return NextResponse.json({
            success: true,
            comment: {
                id: comment.id,
                author: comment.author,
                avatar: comment.avatar,
                content: comment.content,
                timeAgo: getTimeAgo(new Date(comment.createdAt))
            }
        });
    } catch (error: unknown) {
        console.error('Add Comment Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
