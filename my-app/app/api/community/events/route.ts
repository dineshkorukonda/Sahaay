import { NextResponse } from 'next/server';
import connectDB, { isUuid } from '@/lib/db';
import { communityEventAttendees, communityEvents } from '@/lib/schema';
import { asc, eq, sql } from 'drizzle-orm';
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

function formatEventDate(date: Date) {
    return date.toLocaleString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export async function GET(_req: Request) {
    try {
        const db = await connectDB();

        const events = await db.select({
            id: communityEvents.id,
            title: communityEvents.title,
            date: communityEvents.date,
            location: communityEvents.location,
            type: communityEvents.type,
            link: communityEvents.link,
            attendees: sql<number>`count(${communityEventAttendees.userId})::int`,
        }).from(communityEvents)
            .leftJoin(communityEventAttendees, eq(communityEvents.id, communityEventAttendees.eventId))
            .groupBy(communityEvents.id)
            .orderBy(asc(communityEvents.date));

        const formattedEvents = events.map((event) => {
            const eventDate = new Date(event.date);
            return {
                id: event.id,
                title: event.title,
                date: formatEventDate(eventDate),
                day: eventDate.getDate(),
                month: eventDate.toLocaleString('default', { month: 'short' }).toUpperCase(),
                location: event.location,
                type: event.type,
                link: event.link,
                attendees: Number(event.attendees) || 0
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

export async function POST(req: Request) {
    try {
        const db = await connectDB();

        const userId = await getUserId(req);
        if (!isUuid(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { eventId, title, description, date, location, type, link } = await req.json();

        if (eventId) {
            if (!isUuid(eventId)) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }

            const [event] = await db.select().from(communityEvents).where(eq(communityEvents.id, eventId)).limit(1);
            if (!event) {
                return NextResponse.json({ error: 'Event not found' }, { status: 404 });
            }

            await db.insert(communityEventAttendees).values({ eventId, userId }).onConflictDoNothing();

            const [countRow] = await db.select({
                attendees: sql<number>`count(*)::int`,
            }).from(communityEventAttendees).where(eq(communityEventAttendees.eventId, eventId));

            return NextResponse.json({
                success: true,
                message: 'RSVP successful',
                event: {
                    id: event.id,
                    title: event.title,
                    attendees: Number(countRow?.attendees) || 0
                }
            });
        }

        if (!title || !date || !location || !type) {
            return NextResponse.json({ error: 'Title, date, location, and type are required' }, { status: 400 });
        }

        const [event] = await db.insert(communityEvents).values({
            title,
            description,
            date: new Date(date),
            location,
            type,
            link,
            createdBy: userId,
        }).returning();

        await db.insert(communityEventAttendees).values({ eventId: event.id, userId });

        return NextResponse.json({
            success: true,
            event: {
                id: event.id,
                title: event.title,
                date: formatEventDate(new Date(event.date)),
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
