import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema(
  {
    companyId: { type: String, required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    ndisNumber: { type: String, required: true, trim: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String, default: "other" },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    emergencyContactName: { type: String, required: true },
    emergencyContactPhone: { type: String, required: true },
    supportNeeds: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.models.Participant || mongoose.model("Participant", ParticipantSchema);
