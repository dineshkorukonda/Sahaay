import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { CommunityComment } from '@/lib/models';
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

// Get comments for a post
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        
        const { id } = await params;
        const comments = await CommunityComment.find({ postId: id })
            .sort({ createdAt: -1 })
            .populate('userId', 'name email')
            .lean();

        const formattedComments = comments.map((comment: any) => ({
            id: comment._id.toString(),
            author: comment.author || comment.userId?.name || 'Anonymous',
            avatar: comment.avatar || (comment.userId?.name ? comment.userId.name.substring(0, 2).toUpperCase() : 'U'),
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

function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
}
