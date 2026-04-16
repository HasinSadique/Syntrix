import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      index: true
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
      index: true
    },
    reportedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    actionTaken: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "closed"],
      default: "open",
      index: true
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

incidentSchema.index({ companyId: 1, status: 1, severity: 1, reportedAt: -1 });
incidentSchema.index({ companyId: 1, participantId: 1, reportedAt: -1 });

export const Incident =
  mongoose.models.Incident || mongoose.model("Incident", incidentSchema);
