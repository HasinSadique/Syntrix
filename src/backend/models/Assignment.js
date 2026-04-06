import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, index: true },
    participantId: { type: String, required: true, index: true },
    workerId: { type: String, required: true, index: true },
    assignedBy: { type: String, required: true },
    assignedDate: { type: String, required: true },
    status: { type: String, enum: ["active", "completed"], default: "active" },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);
