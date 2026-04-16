import mongoose from "mongoose";

const workerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },
    employeeCode: {
      type: String,
      required: true,
      trim: true
    },
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "casual", "contract"],
      default: "casual"
    },
    jobTitle: {
      type: String,
      trim: true
    },
    availabilityStatus: {
      type: String,
      enum: ["available", "limited", "unavailable", "on_leave"],
      default: "available",
      index: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

workerProfileSchema.index({ companyId: 1, employeeCode: 1 }, { unique: true });
workerProfileSchema.index({ companyId: 1, availabilityStatus: 1 });

export const WorkerProfile =
  mongoose.models.WorkerProfile ||
  mongoose.model("WorkerProfile", workerProfileSchema);
