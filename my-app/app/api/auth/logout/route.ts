import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(_req: Request) {
    try {
        // Clear the token cookie
        const cookieStore = await cookies();
        cookieStore.delete('token');
        
        return NextResponse.json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    } catch (error: unknown) {
        console.error('Logout Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
