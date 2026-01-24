import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { CommunityPost, User } from '@/lib/models';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

// Helper function to get user ID from token
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

// Get all posts
export async function GET(req: Request) {
    try {
        await connectDB();
        
        const posts = await CommunityPost.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('userId', 'name email')
            .lean();

        // Format posts for frontend
        const formattedPosts = posts.map((post: any) => {
            const timeAgo = getTimeAgo(new Date(post.createdAt));
            return {
                id: post._id.toString(),
                author: post.author || post.userId?.name || 'Anonymous',
                avatar: post.avatar || (post.userId?.name ? post.userId.name.substring(0, 2).toUpperCase() : 'U'),
                content: post.content,
                category: post.category,
                likes: post.likes?.length || 0,
                comments: post.comments?.length || 0,
                timeAgo,
                createdAt: post.createdAt
            };
        });

        return NextResponse.json({
            success: true,
            posts: formattedPosts
        });
    } catch (error: unknown) {
        console.error('Community Posts GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Create a new post
export async function POST(req: Request) {
    try {
        await connectDB();
        
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { content, category } = await req.json();

        if (!content || !category) {
            return NextResponse.json({ error: 'Content and category are required' }, { status: 400 });
        }

        const post = await CommunityPost.create({
            userId,
            author: user.name || user.email.split('@')[0],
            avatar: user.name ? user.name.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase(),
            content,
            category,
            likes: [],
            comments: []
        });

        const timeAgo = getTimeAgo(new Date(post.createdAt));

        return NextResponse.json({
            success: true,
            post: {
                id: post._id.toString(),
                author: post.author,
                avatar: post.avatar,
                content: post.content,
                category: post.category,
                likes: 0,
                comments: 0,
                timeAgo
            }
        });
    } catch (error: unknown) {
        console.error('Community Posts POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
}
