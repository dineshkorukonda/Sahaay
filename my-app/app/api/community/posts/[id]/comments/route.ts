import { NextResponse } from 'next/server';
import connectDB, { isUuid } from '@/lib/db';
import { communityComments, users } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';

function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const db = await connectDB();

        const { id } = await params;
        if (!isUuid(id)) {
            return NextResponse.json({ success: true, comments: [] });
        }

        const comments = await db.select({
            id: communityComments.id,
            author: communityComments.author,
            avatar: communityComments.avatar,
            content: communityComments.content,
            createdAt: communityComments.createdAt,
            userName: users.name,
        }).from(communityComments)
            .leftJoin(users, eq(communityComments.userId, users.id))
            .where(eq(communityComments.postId, id))
            .orderBy(desc(communityComments.createdAt));

        const formattedComments = comments.map((comment) => ({
            id: comment.id,
            author: comment.author || comment.userName || 'Anonymous',
            avatar: comment.avatar || (comment.userName ? comment.userName.substring(0, 2).toUpperCase() : 'U'),
            content: comment.content,
            timeAgo: getTimeAgo(new Date(comment.createdAt))
        }));

        return NextResponse.json({
            success: true,
            comments: formattedComments
        });
    } catch (error: unknown) {
        console.error('Get Comments Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
