import * as mongoose from 'mongoose';

// Define the global mongoose type
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then(mongooseInstance => {
        cached.conn = mongooseInstance.connection;
        return cached;
      });
  }

  try {
    const resolved = await cached.promise;
    if (!resolved) {
      throw new Error('Failed to resolve mongoose connection');
    }
    cached.conn = resolved.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Setup change streams after connecting
dbConnect()
  .then(() => {
    // Import here to avoid circular dependency
    import('@/models/Product').then(ProductModule => {
      const Product = ProductModule.default;
      // Check if setupChangeStream exists before calling
      if (typeof Product.setupChangeStream === 'function') {
        Product.setupChangeStream();
      } else {
        console.warn('setupChangeStream method not found on Product model');
      }
    });
  })
  .catch(err => console.error('Failed to set up change streams:', err));

export default dbConnect;