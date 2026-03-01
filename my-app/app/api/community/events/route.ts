import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { CommunityEvent } from '@/lib/models';
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

// Get all events
export async function GET(_req: Request) {
    try {
        await connectDB();

        const events = await CommunityEvent.find()
            .sort({ date: 1 })
            .populate('createdBy', 'name')
            .lean();

        const formattedEvents = events.map((event: { _id: { toString(): string }; date: string | Date; title?: string; location?: string; type?: string; link?: string; attendees?: unknown[] }) => {
            const eventDate = new Date(event.date);
            const day = eventDate.getDate();
            const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
            const formattedDate = eventDate.toLocaleString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });

            return {
                id: event._id.toString(),
                title: event.title,
                date: formattedDate,
                day,
                month,
                location: event.location,
                type: event.type,
                link: event.link,
                attendees: event.attendees?.length || 0
            };
        });

        return NextResponse.json({
            success: true,
            events: formattedEvents
        });
    } catch (error: unknown) {
        console.error('Community Events GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Create an event or RSVP to an event
export async function POST(req: Request) {
    try {
        await connectDB();

        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { eventId, title, description, date, location, type, link } = await req.json();

        // If eventId provided, RSVP to existing event
        if (eventId) {
            const event = await CommunityEvent.findById(eventId);
            if (!event) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }

            const isAttending = event.attendees.some((attendeeId: unknown) => String(attendeeId) === userId);
            if (!isAttending) {
                event.attendees.push(userId as any);
                await event.save();
            }

            return NextResponse.json({
                success: true,
                message: 'RSVP successful',
                event: {
                    id: event._id.toString(),
                    title: event.title,
                    attendees: event.attendees.length
                }
            });
        }

        // Create new event
        if (!title || !date || !location || !type) {
            return NextResponse.json({ error: 'Title, date, location, and type are required' }, { status: 400 });
        }

        const event = await CommunityEvent.create({
            title,
            description,
            date: new Date(date),
            location,
            type,
            link,
            attendees: [userId],
            createdBy: userId
        });

        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });

        return NextResponse.json({
            success: true,
            event: {
                id: event._id.toString(),
                title: event.title,
                date: formattedDate,
                location: event.location,
                type: event.type,
                attendees: 1
            }
        });
    } catch (error: unknown) {
        console.error('Community Events POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
