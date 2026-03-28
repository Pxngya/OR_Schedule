import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('❌ Please define MONGODB_URI in .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000, // 🔥 กัน timeout
      };

      cached.promise = mongoose.connect(MONGODB_URI, opts)
        .then((mongoose) => {
          console.log('✅ MongoDB Connected');
          return mongoose;
        })
        .catch((err) => {
          console.error('❌ MongoDB Error:', err);
          cached.promise = null;
          throw err;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;

  } catch (error) {
    console.error('❌ connectToDatabase fail:', error);
    throw error;
  }
}

export default connectToDatabase;