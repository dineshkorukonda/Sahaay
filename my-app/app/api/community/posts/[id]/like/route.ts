import { NextResponse } from 'next/server';
import connectDB, { isUuid } from '@/lib/db';
import { communityPostLikes, communityPosts } from '@/lib/schema';
import { and, eq, sql } from 'drizzle-orm';
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

        const { id } = await params;
        if (!isUuid(id)) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const [post] = await db.select({ id: communityPosts.id }).from(communityPosts).where(eq(communityPosts.id, id)).limit(1);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const [existingLike] = await db.select().from(communityPostLikes).where(and(
            eq(communityPostLikes.postId, id),
            eq(communityPostLikes.userId, userId),
        )).limit(1);

        if (existingLike) {
            await db.delete(communityPostLikes).where(and(
                eq(communityPostLikes.postId, id),
                eq(communityPostLikes.userId, userId),
            ));
        } else {
            await db.insert(communityPostLikes).values({ postId: id, userId });
        }

        const [countRow] = await db.select({
            likesCount: sql<number>`count(*)::int`,
        }).from(communityPostLikes).where(eq(communityPostLikes.postId, id));

        return NextResponse.json({
            success: true,
            liked: !existingLike,
            likesCount: Number(countRow?.likesCount) || 0
        });
    } catch (error: unknown) {
        console.error('Like Post Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
