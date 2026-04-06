import mongoose from "mongoose";

const IncidentSchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, index: true },
    participantId: { type: String, required: true, index: true },
    workerId: { type: String, required: true, index: true },
    incidentType: { type: String, required: true },
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
    description: { type: String, required: true },
    incidentDate: { type: String, required: true },
    status: { type: String, enum: ["open", "reviewing", "resolved"], default: "open" },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.Incident || mongoose.model("Incident", IncidentSchema);
