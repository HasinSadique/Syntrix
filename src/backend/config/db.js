import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (isConnected) return mongoose.connection;

  try {
    await mongoose.connect(uri, { dbName: "syntrix" });
    isConnected = true;
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}
