import { connectDB } from "@/backend/config/db";
import User from "@/backend/models/User";

function normalize(doc) {
  if (!doc) return null;
  const data = doc.toObject ? doc.toObject() : doc;
  return { ...data, id: data._id.toString() };
}

export const userRepository = {
  async getUserById(id) {
    await connectDB();
    const doc = await User.findById(id);
    return normalize(doc);
  },

  async getUserByEmail(email) {
    await connectDB();
    const doc = await User.findOne({ email: email.toLowerCase() });
    return normalize(doc);
  },

  async listUsersByCompany(companyId, filters = {}) {
    await connectDB();
    const query = { companyId };
    if (filters.role) query.role = filters.role;
    const docs = await User.find(query).sort({ createdAt: -1 });
    return docs.map(normalize);
  },

  async createUser(payload) {
    await connectDB();
    const doc = await User.create(payload);
    return normalize(doc);
  },

  async updateUser(id, updates) {
    await connectDB();
    const doc = await User.findByIdAndUpdate(id, updates, { new: true });
    return normalize(doc);
  },

  async countAllUsers() {
    await connectDB();
    return User.countDocuments({});
  },

  async countUsersByCompany(companyId) {
    await connectDB();
    return User.countDocuments({ companyId });
  },
};
