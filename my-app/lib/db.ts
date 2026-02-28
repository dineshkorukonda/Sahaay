import mongoose from 'mongoose';

// Support both B_URL and DB_URL for flexibility. In development, fall back to local MongoDB if unset.
// Set USE_LOCAL_MONGO=1 in .env to force local MongoDB (avoids Atlas DNS/network issues).
const LOCAL_MONGO = 'mongodb://localhost:27017/sahaay';
const MONGODB_URI =
    process.env.USE_LOCAL_MONGO === '1' || process.env.USE_LOCAL_MONGO === 'true'
        ? LOCAL_MONGO
        : process.env.B_URL ||
          process.env.DB_URL ||
          (process.env.NODE_ENV !== 'production' ? LOCAL_MONGO : undefined);

if (!MONGODB_URI) {
    throw new Error('Please define the B_URL or DB_URL environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}


// Declare global mongoose correctly
declare global {
    var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
    global.mongoose = cached;
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
            console.log('MongoDB Connected');
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default connectDB;
