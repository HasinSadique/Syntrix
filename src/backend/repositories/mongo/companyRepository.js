import { connectDB } from "@/backend/config/db";
import Company from "@/backend/models/Company";

function normalize(doc) {
  if (!doc) return null;
  const data = doc.toObject ? doc.toObject() : doc;
  return { ...data, id: data._id.toString() };
}

export const companyRepository = {
  async listCompanies() {
    await connectDB();
    const docs = await Company.find({}).sort({ createdAt: -1 });
    return docs.map(normalize);
  },

  async getCompanyById(id) {
    await connectDB();
    const doc = await Company.findById(id);
    return normalize(doc);
  },

  async getCompanyByEmail(email) {
    await connectDB();
    const doc = await Company.findOne({ email: email.toLowerCase() });
    return normalize(doc);
  },

  async createCompany(payload) {
    await connectDB();
    const doc = await Company.create(payload);
    return normalize(doc);
  },

  async updateCompany(id, updates) {
    await connectDB();
    const doc = await Company.findByIdAndUpdate(id, updates, { new: true });
    return normalize(doc);
  },
};
