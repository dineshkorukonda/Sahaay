import { NextResponse } from 'next/server';
import connectDB, { isUuid } from '@/lib/db';
import { communityComments, communityPostLikes, communityPosts, users } from '@/lib/schema';
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

function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

export async function GET(_req: Request) {
    try {
        const db = await connectDB();

        const posts = await db.select({
            id: communityPosts.id,
            author: communityPosts.author,
            avatar: communityPosts.avatar,
            content: communityPosts.content,
            category: communityPosts.category,
            createdAt: communityPosts.createdAt,
            userName: users.name,
            likes: sql<number>`(select count(*)::int from ${communityPostLikes} where ${communityPostLikes.postId} = ${communityPosts.id})`,
            comments: sql<number>`(select count(*)::int from ${communityComments} where ${communityComments.postId} = ${communityPosts.id})`,
        }).from(communityPosts)
            .leftJoin(users, eq(communityPosts.userId, users.id))
            .orderBy(desc(communityPosts.createdAt))
            .limit(50);

        const formattedPosts = posts.map((post) => ({
            id: post.id,
            author: post.author || post.userName || 'Anonymous',
            avatar: post.avatar || (post.userName ? post.userName.substring(0, 2).toUpperCase() : 'U'),
            content: post.content,
            category: post.category,
            likes: Number(post.likes) || 0,
            comments: Number(post.comments) || 0,
            timeAgo: getTimeAgo(new Date(post.createdAt)),
            createdAt: post.createdAt
        }));

        return NextResponse.json({
            success: true,
            posts: formattedPosts
        });
    } catch (error: unknown) {
        console.error('Community Posts GET Error:', error);
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

        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { content, category } = await req.json();

        if (!content || !category) {
            return NextResponse.json({ error: 'Content and category are required' }, { status: 400 });
        }

        const [post] = await db.insert(communityPosts).values({
            userId,
            author: user.name || user.email.split('@')[0],
            avatar: user.name ? user.name.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase(),
            content,
            category,
        }).returning();

        return NextResponse.json({
            success: true,
            post: {
                id: post.id,
                author: post.author,
                avatar: post.avatar,
                content: post.content,
                category: post.category,
                likes: 0,
                comments: 0,
                timeAgo: getTimeAgo(new Date(post.createdAt))
            }
        });
    } catch (error: unknown) {
        console.error('Community Posts POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
