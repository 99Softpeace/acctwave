import mongoose from 'mongoose';

// Allow build to proceed without DB connection, but fail at runtime if missing
const MONGODB_URI = process.env.MONGODB_URI || '';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        // [FIX] Check if connection is actually alive (1 = Connected)
        // cached.conn is the mongoose instance, so we need .connection
        if (cached.conn.connection.readyState === 1) {
            return cached.conn;
        }
        console.warn('Database connection found but not ready (State: ' + cached.conn.connection.readyState + '). Reconnecting...');
        // Force reset to allow reconnection below
        cached.conn = null;
        cached.promise = null;
    }

    if (!MONGODB_URI) {
        // This allows static generation to pass without a DB connection
        // but will fail if an actual DB call is made
        console.warn('MONGODB_URI is not defined');
        return null;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4 // Use IPv4, skip IPv6
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
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

export default dbConnect;
