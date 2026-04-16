const isProd = process.env.NODE_ENV === "production";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

const jwtFallback = "syntrix-dev-secret-change-me";
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET || jwtFallback;

if (isProd && !process.env.JWT_ACCESS_SECRET) {
  console.warn(
    "JWT_ACCESS_SECRET is missing. Using fallback secret; set JWT_ACCESS_SECRET for production security."
  );
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  appName: process.env.APP_NAME || "Syntrix",
  mongodbUri: process.env.MONGODB_URI,
  mongoDbName: process.env.MONGO_DB_NAME || "syntrixDB",
  jwtAccessSecret,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1d"
};
