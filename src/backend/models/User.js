import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    role: {
      type: String,
      enum: ["company_admin", "support_worker", "manager", "coordinator"],
      required: true,
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
