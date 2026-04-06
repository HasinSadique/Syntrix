import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    abn: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "suspended", "pending_review"],
      default: "active",
    },
    createdBy: { type: String, default: "self_registration" },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.Company || mongoose.model("Company", CompanySchema);
