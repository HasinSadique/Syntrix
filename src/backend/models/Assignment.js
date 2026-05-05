import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
      index: true
    },
    workerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    careManagerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "cancelled"],
      default: "active",
      index: true
    },
    supportTitle: {
      type: String,
      trim: true
    },
    supportDescription: {
      type: String,
      trim: true
    },
    routineDayKeys: {
      type: [String],
      default: undefined
    },
    routineStartTime: {
      type: String,
      trim: true
    },
    routineEndTime: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

assignmentSchema.pre("validate", function validateDateRange() {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    throw new Error("endDate must be after or equal to startDate");
  }
});

assignmentSchema.index({ companyId: 1, participantId: 1, status: 1 });
assignmentSchema.index({ companyId: 1, workerUserId: 1, status: 1 });
assignmentSchema.index({ companyId: 1, startDate: -1 });

export const Assignment =
  mongoose.models.Assignment || mongoose.model("Assignment", assignmentSchema);
