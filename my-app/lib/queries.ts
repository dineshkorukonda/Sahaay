import { desc, eq } from 'drizzle-orm';
import type { Database } from './db';
import { carePlans } from './schema';

export async function latestCarePlan(db: Database, userId: string) {
    const [plan] = await db
        .select()
        .from(carePlans)
        .where(eq(carePlans.userId, userId))
        .orderBy(desc(carePlans.updatedAt))
        .limit(1);
    return plan ?? null;
}
