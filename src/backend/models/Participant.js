import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    preferredName: {
      type: String,
      trim: true
    },
    dob: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ["female", "male", "non_binary", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say"
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    primaryDisability: {
      type: String,
      trim: true
    },
    secondaryDisability: {
      type: String,
      trim: true
    },
    medicalAlerts: {
      type: [String],
      default: []
    },
    highRiskFlags: {
      type: [String],
      default: []
    },
    epilepsyProtocol: {
      type: String,
      trim: true
    },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relationship: { type: String, trim: true }
    },
    ndisNumber: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      enum: ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"],
      required: true
    },
    managementType: {
      type: String,
      enum: ["agency_managed", "plan_managed", "self_managed"]
    },
    staffRatio: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["active", "inactive", "on_hold", "discharged"],
      default: "active",
      index: true
    }
  },
  {
    timestamps: true
  }
);

participantSchema.virtual("fullName").get(function fullName() {
  return `${this.firstName} ${this.lastName}`;
});

participantSchema.index({ companyId: 1, ndisNumber: 1 }, { unique: true });
participantSchema.index({ companyId: 1, state: 1, status: 1 });
participantSchema.index({ companyId: 1, lastName: 1, firstName: 1 });

export const Participant =
  mongoose.models.Participant || mongoose.model("Participant", participantSchema);
