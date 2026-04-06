import { connectDB } from "@/backend/config/db";
import SuperAdmin from "@/backend/models/SuperAdmin";

function normalize(doc) {
  if (!doc) return null;
  const data = doc.toObject ? doc.toObject() : doc;
  return { ...data, id: data._id.toString() };
}

export const superAdminRepository = {
  async getByEmail(email) {
    await connectDB();
    const doc = await SuperAdmin.findOne({ email: email.toLowerCase() });
    return normalize(doc);
  },

  async getById(id) {
    await connectDB();
    const doc = await SuperAdmin.findById(id);
    return normalize(doc);
  },
};
