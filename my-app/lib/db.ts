import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export type Database = NeonHttpDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { sahaayDb?: Database };

function databaseUrl() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error('Please define the DATABASE_URL environment variable inside .env');
    }
    return url;
}

export function getDb(): Database {
    if (!globalForDb.sahaayDb) {
        const sql = neon(databaseUrl());
        globalForDb.sahaayDb = drizzle(sql, { schema });
    }
    return globalForDb.sahaayDb;
}

export default async function connectDB() {
    return getDb();
}

export function withId<T extends { id: string }>(row: T): T & { _id: string } {
    return { ...row, _id: row.id };
}

export function isUuid(value: string | null | undefined): value is string {
    return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function isUniqueViolation(error: unknown): boolean {
    if (error && typeof error === 'object' && 'code' in error && (error as { code?: string }).code === '23505') {
        return true;
    }
    return error instanceof Error && /duplicate key|unique constraint/i.test(error.message);
}
