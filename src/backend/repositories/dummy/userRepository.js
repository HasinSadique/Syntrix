import { generateId } from "@/backend/repositories/dummy/id";
import { nowIso, readJsonFile, writeJsonFile } from "@/backend/repositories/dummy/fileStore";

const FILE = "users.json";

export const userRepository = {
  async getUserById(id) {
    const users = await readJsonFile(FILE);
    return users.find((user) => user.id === id) || null;
  },

  async getUserByEmail(email) {
    const users = await readJsonFile(FILE);
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async listUsersByCompany(companyId, filters = {}) {
    const users = await readJsonFile(FILE);
    return users.filter((user) => {
      if (user.companyId !== companyId) return false;
      if (filters.role && user.role !== filters.role) return false;
      return true;
    });
  },

  async createUser(payload) {
    const users = await readJsonFile(FILE);
    const now = nowIso();
    const newUser = {
      id: generateId("usr"),
      ...payload,
      status: payload.status || "active",
      createdAt: now,
      updatedAt: now,
    };
    users.push(newUser);
    await writeJsonFile(FILE, users);
    return newUser;
  },

  async updateUser(id, updates) {
    const users = await readJsonFile(FILE);
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) return null;
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: nowIso(),
    };
    await writeJsonFile(FILE, users);
    return users[index];
  },

  async countAllUsers() {
    const users = await readJsonFile(FILE);
    return users.length;
  },

  async countUsersByCompany(companyId) {
    const users = await readJsonFile(FILE);
    return users.filter((user) => user.companyId === companyId).length;
  },
};
