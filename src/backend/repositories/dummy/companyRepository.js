import { generateId } from "@/backend/repositories/dummy/id";
import { nowIso, readJsonFile, writeJsonFile } from "@/backend/repositories/dummy/fileStore";

const FILE = "companies.json";

export const companyRepository = {
  async listCompanies() {
    return readJsonFile(FILE);
  },

  async getCompanyById(id) {
    const companies = await readJsonFile(FILE);
    return companies.find((company) => company.id === id) || null;
  },

  async getCompanyByEmail(email) {
    const companies = await readJsonFile(FILE);
    return companies.find((company) => company.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createCompany(payload) {
    const companies = await readJsonFile(FILE);
    const now = nowIso();
    const newCompany = {
      id: generateId("cmp"),
      ...payload,
      status: payload.status || "active",
      createdAt: now,
      updatedAt: now,
    };
    companies.push(newCompany);
    await writeJsonFile(FILE, companies);
    return newCompany;
  },

  async updateCompany(id, updates) {
    const companies = await readJsonFile(FILE);
    const index = companies.findIndex((company) => company.id === id);
    if (index === -1) return null;
    companies[index] = {
      ...companies[index],
      ...updates,
      updatedAt: nowIso(),
    };
    await writeJsonFile(FILE, companies);
    return companies[index];
  },
};
