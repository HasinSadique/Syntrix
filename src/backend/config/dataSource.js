export const DATA_SOURCE = process.env.MONGODB_URI?.trim() ? "mongo" : "dummy";

export function isMongoEnabled() {
  return DATA_SOURCE === "mongo";
}
