import mongoose from "mongoose";

const shiftNoteSchema = new mongoose.Schema(
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
      required: true,
      index: true
    },
    submittedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    noteText: {
      type: String,
      required: true,
      trim: true
    },
    participantUpdate: {
      type: String,
      trim: true
    },
    mileageKm: {
      type: Number,
      default: 0,
      min: 0
    },
    expenseAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    reviewStatus: {
      type: String,
      enum: ["pending", "reviewed", "needs_changes"],
      default: "pending",
      index: true
    }
  },
  {
    timestamps: true
  }
);

shiftNoteSchema.index({ companyId: 1, shiftId: 1 }, { unique: true });
shiftNoteSchema.index({ companyId: 1, submittedByUserId: 1, submittedAt: -1 });
shiftNoteSchema.index({ companyId: 1, reviewStatus: 1, submittedAt: -1 });

export const ShiftNote =
  mongoose.models.ShiftNote || mongoose.model("ShiftNote", shiftNoteSchema);
