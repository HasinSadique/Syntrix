import { readJsonFile } from "@/backend/repositories/dummy/fileStore";

const FILE = "superadmins.json";

export const superAdminRepository = {
  async getByEmail(email) {
    const admins = await readJsonFile(FILE);
    return admins.find((admin) => admin.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getById(id) {
    const admins = await readJsonFile(FILE);
    return admins.find((admin) => admin.id === id) || null;
  },
};
