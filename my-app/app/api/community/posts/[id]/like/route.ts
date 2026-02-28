import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { CommunityPost } from '@/lib/models';
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

// Like/Unlike a post
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const post = await CommunityPost.findById(id);
        
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const isLiked = post.likes.some((likeId: unknown) => String(likeId) === userId);

        if (isLiked) {
            // Unlike
            post.likes = post.likes.filter((likeId: unknown) => String(likeId) !== userId);
        } else {
            // Like
            post.likes.push(userId);
        }

        await post.save();

        return NextResponse.json({
            success: true,
            liked: !isLiked,
            likesCount: post.likes.length
        });
    } catch (error: unknown) {
        console.error('Like Post Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

