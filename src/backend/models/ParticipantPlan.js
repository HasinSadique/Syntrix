import mongoose from "mongoose";

const participantPlanSchema = new mongoose.Schema(
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
    coordinatorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    planStart: {
      type: Date,
      required: true
    },
    planEnd: {
      type: Date,
      required: true
    },
    goals: {
      type: [String],
      default: []
    },
    supportNeeds: {
      type: [String],
      default: []
    },
    risks: {
      type: [String],
      default: []
    },
    preferences: {
      type: [String],
      default: []
    },
    serviceAgreementStatus: {
      type: String,
      enum: ["draft", "pending", "signed", "expired"],
      default: "draft",
      index: true
    }
  },
  {
    timestamps: true
  }
);

participantPlanSchema.pre("validate", function validatePlanRange() {
  if (this.planStart && this.planEnd && this.planEnd < this.planStart) {
    throw new Error("planEnd must be after or equal to planStart");
  }
});

participantPlanSchema.index({ companyId: 1, participantId: 1, planStart: -1 });
participantPlanSchema.index({ companyId: 1, coordinatorUserId: 1, planEnd: 1 });

export const ParticipantPlan =
  mongoose.models.ParticipantPlan ||
  mongoose.model("ParticipantPlan", participantPlanSchema);
