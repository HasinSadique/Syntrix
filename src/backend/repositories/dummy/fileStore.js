import fs from "fs/promises";
import path from "path";

const dataDir = path.join(process.cwd(), "src", "data");

function filePath(fileName) {
  return path.join(dataDir, fileName);
}

export async function readJsonFile(fileName) {
  const content = await fs.readFile(filePath(fileName), "utf-8");
  return JSON.parse(content);
}

export async function writeJsonFile(fileName, data) {
  await fs.writeFile(filePath(fileName), JSON.stringify(data, null, 2));
}

export function nowIso() {
  return new Date().toISOString();
}
