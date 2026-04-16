import mongoose from "mongoose";

const complianceRecordSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    requirementName: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["compliant", "expiring", "expired", "missing"],
      default: "missing",
      index: true
    },
    expiryDate: {
      type: Date,
      index: true
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      index: true
    },
    checkedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

complianceRecordSchema.index({ companyId: 1, userId: 1, requirementName: 1 }, { unique: true });
complianceRecordSchema.index({ companyId: 1, status: 1, expiryDate: 1 });

export const ComplianceRecord =
  mongoose.models.ComplianceRecord ||
  mongoose.model("ComplianceRecord", complianceRecordSchema);
