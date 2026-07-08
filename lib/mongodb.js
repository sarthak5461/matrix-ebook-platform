import { MongoClient } from "mongodb";

let cached = global._mongoCache;
if (!cached) {
  cached = global._mongoCache = { client: null, db: null, promise: null };
}

export async function getDb() {
  if (cached.db) return cached.db;
  if (!cached.promise) {
    const client = new MongoClient(process.env.MONGODB_URI);
    cached.promise = client.connect().then(() => {
      cached.client = client;
      cached.db = client.db(process.env.DB_NAME || "matrix-ebook");
      return cached.db;
    });
  }
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI");
  }
  await cached.promise;
  return cached.db;
}
