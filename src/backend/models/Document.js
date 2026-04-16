import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },
    entityType: {
      type: String,
      enum: [
        "company",
        "participant",
        "user",
        "worker_profile",
        "shift",
        "incident",
        "compliance_record",
        "other"
      ],
      required: true,
      index: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    documentType: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      type: String,
      default: "",
      trim: true
    },
    issueDate: {
      type: Date
    },
    expiryDate: {
      type: Date,
      index: true
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected", "expired"],
      default: "pending",
      index: true
    },
    uploadedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

documentSchema.index({ companyId: 1, entityType: 1, entityId: 1, documentType: 1 });
documentSchema.index({ companyId: 1, verificationStatus: 1, expiryDate: 1 });

export const Document =
  mongoose.models.Document || mongoose.model("Document", documentSchema);
