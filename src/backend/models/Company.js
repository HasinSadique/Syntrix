import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    abn: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      enum: ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"],
      required: true
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true
    }
  },
  {
    timestamps: true
  }
);

companySchema.index({ name: 1 });
companySchema.index({ state: 1, status: 1 });

export const Company =
  mongoose.models.Company || mongoose.model("Company", companySchema);
