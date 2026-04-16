import mongoose from "mongoose";
import { env } from "@/backend/config/env";

const globalForMongoose = globalThis;

if (!globalForMongoose.mongooseCache) {
  globalForMongoose.mongooseCache = {
    conn: null,
    promise: null
  };
}

const cache = globalForMongoose.mongooseCache;

export async function connectToDatabase() {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(env.mongodbUri, {
        dbName: env.mongoDbName,
        autoIndex: true,
        maxPoolSize: 20
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
