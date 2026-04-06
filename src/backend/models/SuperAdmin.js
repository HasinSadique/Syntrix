import mongoose from "mongoose";

const SuperAdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: "superadmin" },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.SuperAdmin || mongoose.model("SuperAdmin", SuperAdminSchema);
